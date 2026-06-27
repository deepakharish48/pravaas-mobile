import {
  Controller,
  Get,
  Param,
  Post,
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

  @Post("checkin/:id")
  checkIn(
    @Param("id") id: string,
  ) {
    return this.hotelService.checkIn(id);
  }
}