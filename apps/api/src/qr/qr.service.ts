import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";

export type BookingPayload = {
  version: number;

  type: "pravaas_checkin";

  bookingId: string;

  hotelName: string | null;

  guestName: string | null;

  confirmationNumber: string | null;

  checkIn: Date | null;

  checkOut: Date | null;

  identityType: string | null;

  identityName: string | null;

  identityNumber: string | null;
};

@Injectable()
export class QrService {
  async generateQrCode(payload: string): Promise<string> {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  }

  buildBookingPayload(payload: BookingPayload): string {
    return JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}