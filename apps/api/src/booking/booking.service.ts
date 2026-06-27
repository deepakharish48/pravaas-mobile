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