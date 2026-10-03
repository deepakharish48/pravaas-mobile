import {
  Controller,
  Get,
  Param,
  Post,
  Body,
} from "@nestjs/common";

import { HotelService } from "./hotel.service";

@Controller("hotel")
export class HotelController {
  constructor(
    private readonly hotelService: HotelService,
  ) {}

  @Get("dashboard")
  dashboard() {
    return this.hotelService.dashboard();
  }

  @Get("bookings")
  bookings() {
    return this.hotelService.bookings();
  }

  @Get("bookings/:id")
  booking(
    @Param("id") id: string,
  ) {
    return this.hotelService.booking(id);
  }

  @Get("bookings/:id/c-form")
  cForm(@Param("id") id: string) {
    return this.hotelService.getCForm(id);
  }

  @Post("bookings/:id/c-form")
  saveCForm(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.hotelService.saveCForm(id, body);
  }

  @Post("checkin/:id")
  checkIn(
    @Param("id") id: string,
  ) {
    return this.hotelService.checkIn(id);
  }
}