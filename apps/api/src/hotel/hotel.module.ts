import { Module } from "@nestjs/common";
import { HotelController } from "./hotel.controller";
import { HotelService } from "./hotel.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [HotelController],
  providers: [HotelService, PrismaService],
})
export class HotelModule {}