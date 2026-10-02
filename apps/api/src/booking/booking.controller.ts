import {
  Controller,
  Get,
  Body,
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

  @Post(":id/itinerary")
  generateItinerary(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() body: { destination?: string; interests?: string[] },
  ) {
    return this.bookingService.generateItinerary(
      req.user.id,
      id,
      body,
    );
  }


  @Post(":id/itinerary/save")
  saveItinerary(@Request() req: { user: { id: string } }, @Param("id") id: string, @Body() body: { itinerary: any }) {
    return this.bookingService.updateItinerary(req.user.id, id, body.itinerary);
  }

  @Post(":id/assistant")
  assistant(@Request() req: { user: { id: string } }, @Param("id") id: string, @Body() body: { message: string; history?: Array<{ role: string; content: string }> }) {
    return this.bookingService.chatWithShika(req.user.id, id, body.message, body.history);
  }

  @Post(":id/recommendations")
  searchRecommendations(@Request() req: { user: { id: string } }, @Param("id") id: string, @Body() body: { query?: string; destination?: string }) {
    return this.bookingService.findRecommendations(req.user.id, id, body.query ?? "popular attractions", body.destination);
  }

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