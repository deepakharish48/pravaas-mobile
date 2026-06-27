import {
    Injectable,
    NotFoundException,
  } from "@nestjs/common";
  
  import { PrismaService } from "../prisma/prisma.service";
  
  import { formatBooking } from "../booking/booking.mapper";
  
  @Injectable()
  export class HotelService {
    constructor(
      private readonly prisma: PrismaService,
    ) {}
  
    async dashboard() {
      const today = new Date();
  
      const arrivals =
        await this.prisma.booking.count({
          where: {
            checkIn: {
              gte: new Date(
                today.setHours(0, 0, 0, 0),
              ),
            },
          },
        });
  
      const checkedIn =
        await this.prisma.booking.count({
          where: {
            status: "CHECKED_IN",
          },
        });
  
      const pending =
        await this.prisma.booking.count({
          where: {
            status: "CONFIRMED",
          },
        });
  
      const recentGuests =
        await this.prisma.booking.findMany({
          where: {
            status: "CHECKED_IN",
          },
          take: 5,
          orderBy: {
            checkedInAt: "desc",
          },
        });
  
      return {
        hotelName: "Pravaas Demo Hotel",
  
        todaysArrivals: arrivals,
  
        checkedIn,
  
        pendingCheckIns: pending,
  
        recentGuests: recentGuests.map((guest) => ({
          id: guest.id,
          guestName: guest.guestName,
          room: guest.roomType ?? "--",
          checkedInAt:
            guest.checkedInAt?.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ) ?? "--",
        })),
      };
    }
  
    async bookings() {
      const bookings =
        await this.prisma.booking.findMany({
          orderBy: {
            checkIn: "asc",
          },
        });
  
      return bookings.map(formatBooking);
    }
  
    async booking(id: string) {
      const booking =
        await this.prisma.booking.findUnique({
          where: {
            id,
          },
        });
  
      if (!booking) {
        throw new NotFoundException(
          "Booking not found",
        );
      }
  
      return formatBooking(booking);
    }
  
    async checkIn(id: string) {
      const booking =
        await this.prisma.booking.findUnique({
          where: {
            id,
          },
        });
  
      if (!booking) {
        throw new NotFoundException(
          "Booking not found",
        );
      }
  
      await this.prisma.booking.update({
        where: {
          id,
        },
        data: {
          status: "CHECKED_IN",
          checkedInAt: new Date(),
        },
      });
  
      return {
        success: true,
        message: "Guest checked in successfully.",
      };
    }
  }