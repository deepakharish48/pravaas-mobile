import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

import { BookingService } from "./booking.service";

@Controller("bookings")
@UseGuards(AuthGuard("jwt"))
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  upload(
    @Request() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookingService.uploadAndProcess(
      req.user.id,
      file,
    );
  }

  /**
   * Dashboard bookings
   */
  @Get()
  findAll(
    @Request() req: { user: { id: string } },
  ) {
    return this.bookingService.findAllByUser(
      req.user.id,
    );
  }

  /**
   * Travel History
   */
  @Get("travel-history")
  travelHistory(
    @Request() req: { user: { id: string } },
  ) {
    return this.bookingService.travelHistory(
      req.user.id,
    );
  }

  /**
   * Booking Details
   */
  @Get(":id")
  findOne(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.bookingService.findOne(
      req.user.id,
      id,
    );
  }
}