import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { OpenaiModule } from "../openai/openai.module";
import { QrModule } from "../qr/qr.module";

@Module({
  imports: [OpenaiModule, QrModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
