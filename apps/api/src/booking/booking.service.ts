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
  private readonly logger = new Logger(BookingService.name);
  private readonly uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
    private qrService: QrService,
    configService: ConfigService,
  ) {
    this.uploadDir = path.resolve(
      configService.get<string>("UPLOAD_DIR", "./uploads"),
    );
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadAndProcess(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException("Only image files are allowed");
    }

    const ext = path.extname(file.originalname) || ".jpg";
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`Stored booking screenshot at ${filePath}`);

    let extractedDetails = null;

    try {
      extractedDetails = await this.openaiService.extractBookingDetails(filePath);
      this.logger.log(`Extracted booking details for file ${fileName}`);
    } catch (error) {
      this.logger.warn(
        `OpenAI extraction failed, saving booking with image only`,
        error,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        imagePath: filePath,
        hotelName: extractedDetails?.hotelName ?? null,
        guestName: extractedDetails?.guestName ?? null,
        checkIn: extractedDetails?.checkIn
          ? new Date(extractedDetails.checkIn)
          : null,
        checkOut: extractedDetails?.checkOut
          ? new Date(extractedDetails.checkOut)
          : null,
        confirmationNumber: extractedDetails?.confirmationNumber ?? null,
        roomType: extractedDetails?.roomType ?? null,
        numberOfGuests: extractedDetails?.numberOfGuests ?? null,
        totalPrice: extractedDetails?.totalPrice ?? null,
        currency: extractedDetails?.currency ?? null,
        rawExtractedData: extractedDetails
          ? JSON.stringify(extractedDetails)
          : null,
        status: extractedDetails ? "CONFIRMED" : "PENDING",
      },
    });

    /*const payload = this.qrService.buildBookingPayload(
      booking.id,
      booking.confirmationNumber,
    );*/
    const payload = this.qrService.buildBookingPayload({
    type: "pravaas_booking",

    bookingId: booking.id,

    confirmationNumber:
      booking.confirmationNumber,
  });
    const qrCodeDataUrl = await this.qrService.generateQrCode(payload);

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: { qrCode: qrCodeDataUrl },
    });

    return formatBooking(updated);
  }

  async findAllByUser(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map(formatBooking);
  }

  async findOne(userId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return formatBooking(booking);
  }
}
