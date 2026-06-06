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

    const payload = this.qrService.buildBookingPayload(
      booking.id,
      booking.confirmationNumber,
    );

    const qrCodeDataUrl =
      booking.qrCode ?? (await this.qrService.generateQrCode(payload));

    if (!booking.qrCode) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { qrCode: qrCodeDataUrl },
      });
    }

    return {
      bookingId: booking.id,
      qrCodeDataUrl,
      payload,
    };
  }
}
