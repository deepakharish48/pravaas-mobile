import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BookingModule } from "./booking/booking.module";
import { HealthModule } from "./health/health.module";
import { OpenaiModule } from "./openai/openai.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QrModule } from "./qr/qr.module";
import { IdentityModule } from "./identity/identity.module";
import { HotelModule } from "./hotel/hotel.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OpenaiModule,
    BookingModule,
    QrModule,
    IdentityModule,
    HotelModule,
  ],
})
export class AppModule {}
