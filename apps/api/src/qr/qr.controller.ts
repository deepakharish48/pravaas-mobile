import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "../prisma/prisma.service";
import { QrService } from "./qr.service";

@Controller("qr")
@UseGuards(AuthGuard("jwt"))
export class QrController {
  constructor(
    private qrService: QrService,
    private prisma: PrismaService,
  ) {}

  @Get(":bookingId")
  async getBookingQr(
    @Request() req: { user: { id: string } },
    @Param("bookingId") bookingId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user.id },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const documents =
  await this.prisma.identityDocument.findMany({
    where: {
      userId: req.user.id,
    },
  });

const identity =
  documents.find(
    (d) => d.documentType === "AADHAAR",
  ) ??
  documents.find(
    (d) => d.documentType === "PASSPORT",
  ) ??
  documents.find(
    (d) =>
      d.documentType ===
      "DRIVING_LICENSE",
  ) ??
  null;

const payload =
  this.qrService.buildBookingPayload({
    type: "pravaas_checkin",

    bookingId: booking.id,

    hotelName:
      booking.hotelName,

    guestName:
      booking.guestName,

    confirmationNumber:
      booking.confirmationNumber,

    checkIn:
      booking.checkIn,

    checkOut:
      booking.checkOut,

    identityType:
      identity?.documentType ??
      null,

    identityName:
      identity?.fullName ??
      null,

    identityNumber:
      identity?.documentNumber ??
      null,
  });

    const qrCodeDataUrl =
      await this.qrService.generateQrCode(payload);

    /*const qrCodeDataUrl =
      booking.qrCode ?? (await this.qrService.generateQrCode(payload));

    if (!booking.qrCode) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { qrCode: qrCodeDataUrl },
      });
    }*/

    return {
      bookingId: booking.id,
      qrCodeDataUrl,
      payload,
    };
  }
}
