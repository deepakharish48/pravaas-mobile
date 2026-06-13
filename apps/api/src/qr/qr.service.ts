import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";

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

  buildBookingPayload(data: Record<string, any>) {
    return JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
