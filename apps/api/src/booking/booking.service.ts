import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

import { PrismaService } from "../prisma/prisma.service";
import { OpenaiService } from "../openai/openai.service";
import { QrService } from "../qr/qr.service";

import { formatBooking } from "./booking.mapper";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(
    BookingService.name,
  );

  private readonly uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
    private qrService: QrService,
    configService: ConfigService,
  ) {
    this.uploadDir = path.resolve(
      configService.get<string>(
        "UPLOAD_DIR",
        "./uploads",
      ),
    );

    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, {
        recursive: true,
      });
    }
  }

  async uploadAndProcess(
    userId: string,
    file: Express.Multer.File,
  ) {
    this.logger.error("BOOKING SERVICE VERSION 2");
    if (!file) {
      throw new BadRequestException(
        "No file uploaded",
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Only image files are allowed",
      );
    }

    const ext =
      path.extname(file.originalname) || ".jpg";

    const fileName = `${uuidv4()}${ext}`;

    const filePath = path.join(
      this.uploadDir,
      fileName,
    );

    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(
      `Stored booking screenshot at ${filePath}`,
    );

    let extractedDetails = null;

    try {
      extractedDetails =
        await this.openaiService.extractBookingDetails(
          filePath,
        );

      this.logger.log(
        `Booking details extracted`,
      );
    } catch (error) {
      this.logger.warn(
        "OCR extraction failed.",
        error,
      );
    }

    const booking =
      await this.prisma.booking.create({
        data: {
          userId,

          imagePath: filePath,

          hotelName:
            extractedDetails?.hotelName ?? null,

          destination:
            extractedDetails?.destination ?? null,

          guestName:
            extractedDetails?.guestName ?? null,

          confirmationNumber:
            extractedDetails?.confirmationNumber ??
            null,

          checkIn: extractedDetails?.checkIn
            ? new Date(extractedDetails.checkIn)
            : null,

          checkOut: extractedDetails?.checkOut
            ? new Date(extractedDetails.checkOut)
            : null,

          roomType:
            extractedDetails?.roomType ?? null,

          numberOfGuests:
            extractedDetails?.numberOfGuests ??
            null,

          totalPrice:
            extractedDetails?.totalPrice ?? null,

          currency:
            extractedDetails?.currency ?? null,

          rawExtractedData:
            extractedDetails
              ? JSON.stringify(
                  extractedDetails,
                )
              : null,

          status: extractedDetails
            ? "CONFIRMED"
            : "PENDING",
        },
      });

    const identity =
      await this.prisma.identityDocument.findFirst({
        where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
    },
  });
  this.logger.log("========== IDENTITY ==========");
  this.logger.log(identity);
  this.logger.log("==============================");

  this.logger.log({
    identityType: identity?.documentType,
    identityName: identity?.fullName,
    identityNumber: identity?.documentNumber,
  });
const payload =
  this.qrService.buildBookingPayload({
    version: 1,

    type: "pravaas_checkin",

    bookingId: booking.id,

    hotelName: booking.hotelName,

    guestName: booking.guestName,

    confirmationNumber:
      booking.confirmationNumber,

    checkIn: booking.checkIn,

    checkOut: booking.checkOut,

    identityType:
      identity?.documentType ?? null,

    identityName:
      identity?.fullName ?? null,

    identityNumber:
      identity?.documentNumber ?? null,
  });
  this.logger.error(payload);
  
    const qrCodeDataUrl =
      await this.qrService.generateQrCode(
        payload,
      );

    const updated =
      await this.prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          qrCode: qrCodeDataUrl,
        },
      });

    return formatBooking(updated);
  }

  /**
   * Dashboard Bookings
   * Upcoming bookings first.
   */
  async findAllByUser(userId: string) {
    const bookings =
      await this.prisma.booking.findMany({
        where: {
          userId,
        },
        orderBy: {
          checkIn: "asc",
        },
      });

    return bookings.map(formatBooking);
  }

  /**
   * Travel History
   * Past bookings.
   */
  async travelHistory(userId: string) {
    const today = new Date();

    const bookings =
      await this.prisma.booking.findMany({
        where: {
          userId,
          checkOut: {
            lt: today,
          },
        },
        orderBy: {
          checkOut: "desc",
        },
      });

    return bookings.map(formatBooking);
  }

  /**
   * Booking Details
   */
  async generateItinerary(
    userId: string,
    id: string,
    preferences: { destination?: string; interests?: string[] },
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (!booking.checkIn || !booking.checkOut) {
      throw new BadRequestException(
        "Booking check-in and check-out dates are required to plan an itinerary.",
      );
    }
    const destination = preferences.destination?.trim();
    if (!destination || destination.length > 120) {
      throw new BadRequestException("Please provide a valid destination (up to 120 characters).");
    }
    const interests = (preferences.interests ?? []).filter((item) => typeof item === "string").slice(0, 8);
    const itinerary = await this.openaiService.generateItinerary({
      destination,
      hotelName: booking.hotelName,
      checkIn: booking.checkIn.toISOString().slice(0, 10),
      checkOut: booking.checkOut.toISOString().slice(0, 10),
      guests: booking.numberOfGuests,
      interests,
    });
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        destination,
        itineraryData: JSON.stringify(itinerary),
      },
    });
    return itinerary;
  }

  async updateItinerary(userId: string, id: string, itinerary: any) {
    const booking = await this.prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (!itinerary || typeof itinerary.destination !== "string" || !Array.isArray(itinerary.days)) {
      throw new BadRequestException("Please provide a valid itinerary.");
    }
    const clean = {
      destination: itinerary.destination.slice(0, 120),
      days: itinerary.days.slice(0, 30).map((day: any) => ({
        date: String(day.date ?? "").slice(0, 20),
        title: String(day.title ?? "").slice(0, 160),
        activities: Array.isArray(day.activities) ? day.activities.slice(0, 12).map((a: any) => ({
          time: String(a.time ?? "").slice(0, 80),
          name: String(a.name ?? "").slice(0, 160),
          description: String(a.description ?? "").slice(0, 600),
        })) : [],
      })),
    };
    await this.prisma.booking.update({
      where: { id },
      data: { destination: clean.destination, itineraryData: JSON.stringify(clean) },
    });
    return clean;
  }

  async chatWithShika(userId: string, id: string, message: string, history: Array<{role: string; content: string}> = []) {
    const booking = await this.prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (!message?.trim() || message.length > 2000) throw new BadRequestException("Message must be between 1 and 2000 characters.");
    let itinerary: any = null;
    try { itinerary = booking.itineraryData ? JSON.parse(booking.itineraryData) : null; } catch {}
    return this.openaiService.chatWithShika({
      message: message.trim(),
      history: history.filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-10),
      context: {
        destination: booking.destination,
        hotelName: booking.hotelName,
        checkIn: booking.checkIn?.toISOString().slice(0, 10),
        checkOut: booking.checkOut?.toISOString().slice(0, 10),
        guests: booking.numberOfGuests,
        itinerary,
      },
    });
  }

  async findRecommendations(userId: string, id: string, query: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, userId } });
    if (!booking) throw new NotFoundException("Booking not found");
    const destination = booking.destination?.trim();
    if (!destination) throw new BadRequestException("Set a destination before searching for places.");
    const apiKey = this.configService.get<string>("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new BadRequestException("Live recommendations are not configured yet. Set GOOGLE_MAPS_API_KEY on the API.");
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.primaryTypeDisplayName" },
      body: JSON.stringify({ textQuery: `${query || "popular attractions"} in ${destination}`, maxResultCount: 8 }),
    });
    if (!response.ok) {
      this.logger.warn(`Google Places request failed: ${response.status}`);
      throw new BadRequestException("Live places could not be loaded right now.");
    }
    const data: any = await response.json();
    return (data.places ?? []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text ?? "Place",
      address: place.formattedAddress ?? "",
      rating: place.rating ?? null,
      category: place.primaryTypeDisplayName?.text ?? "",
      url: place.googleMapsUri ?? null,
    }));
  }

  async findOne(
    userId: string,
    id: string,
  ) {
    const booking =
      await this.prisma.booking.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!booking) {
      throw new NotFoundException(
        "Booking not found",
      );
    }

    return formatBooking(booking);
  }
}