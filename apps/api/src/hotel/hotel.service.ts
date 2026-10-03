import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { formatBooking } from "../booking/booking.mapper";

type CFormData = {
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  guestName: string;
  nationality: string;
  passportNumber: string;
  visaNumber: string;
  visaType: string;
  indiaContactPhone: string;
  email: string;
  remarks: string;
  arrivedFrom: string;
  arrivalDate: string;
  arrivalTime: string;
  purposeOfVisit: string;
  previousPlaceOfStay: string;
  departureDate: string;
  departureTime: string;
  nextDestination: string;
};

const C_FORM_FIELDS: (keyof CFormData)[] = [
  "hotelName",
  "hotelAddress",
  "hotelPhone",
  "guestName",
  "nationality",
  "passportNumber",
  "visaNumber",
  "visaType",
  "indiaContactPhone",
  "email",
  "remarks",
  "arrivedFrom",
  "arrivalDate",
  "arrivalTime",
  "purposeOfVisit",
  "previousPlaceOfStay",
  "departureDate",
  "departureTime",
  "nextDestination",
];

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

@Injectable()
export class HotelService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const arrivals = await this.prisma.booking.count({
      where: {
        checkIn: {
          gte: today,
        },
      },
    });

    const checkedIn = await this.prisma.booking.count({
      where: {
        status: "CHECKED_IN",
      },
    });

    const pending = await this.prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const recentGuests = await this.prisma.booking.findMany({
      where: {
        status: "CHECKED_IN",
      },
      take: 5,
      orderBy: {
        updatedAt: "desc",
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
        checkedInAt: guest.updatedAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    };
  }

  async bookings() {
    const bookings = await this.prisma.booking.findMany({
      orderBy: {
        checkIn: "asc",
      },
    });

    return bookings.map(formatBooking);
  }

  async booking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return formatBooking(booking);
  }

  async getCForm(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { cForm: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.cForm) {
      return {
        saved: true,
        savedAt: booking.cForm.savedAt,
        data: JSON.parse(booking.cForm.data) as CFormData,
      };
    }

    const [passport, visa, user] = await Promise.all([
      this.prisma.identityDocument.findFirst({
        where: {
          userId: booking.userId,
          documentType: "PASSPORT",
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      this.prisma.identityDocument.findFirst({
        where: {
          userId: booking.userId,
          documentType: "VISA",
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      this.prisma.user.findUnique({
        where: { id: booking.userId },
        select: { email: true },
      }),
    ]);

    const data: CFormData = {
      hotelName: booking.hotelName ?? "Pravaas Demo Hotel",
      hotelAddress: "",
      hotelPhone: "",
      guestName: passport?.fullName ?? booking.guestName ?? "",
      nationality: passport?.nationality ?? "",
      passportNumber: passport?.documentNumber ?? "",
      visaNumber: visa?.documentNumber ?? "",
      visaType: "",
      indiaContactPhone: "",
      email: user?.email ?? "",
      remarks: "",
      arrivedFrom: "",
      arrivalDate: dateOnly(booking.checkIn),
      arrivalTime: "",
      purposeOfVisit: "",
      previousPlaceOfStay: "",
      departureDate: dateOnly(booking.checkOut),
      departureTime: "",
      nextDestination: "",
    };

    return {
      saved: false,
      savedAt: null,
      data,
    };
  }

  async saveCForm(id: string, input: Record<string, unknown>) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const current = await this.getCForm(id);
    const data = { ...current.data } as CFormData;

    for (const field of C_FORM_FIELDS) {
      if (field in input) {
        data[field] = String(input[field] ?? "").trim().slice(0, 1000);
      }
    }

    const requiredFields: (keyof CFormData)[] = [
      "guestName",
      "nationality",
      "passportNumber",
      "visaNumber",
    ];

    const missing = requiredFields.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new BadRequestException(
        `Required Form III fields missing: ${missing.join(", ")}`,
      );
    }

    const saved = await this.prisma.cForm.upsert({
      where: {
        bookingId: id,
      },
      create: {
        bookingId: id,
        data: JSON.stringify(data),
      },
      update: {
        data: JSON.stringify(data),
      },
    });

    return {
      saved: true,
      savedAt: saved.savedAt,
      data,
    };
  }

  async checkIn(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    await this.prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: "CHECKED_IN",
      },
    });

    return {
      success: true,
      message: "Guest marked as checked in.",
    };
  }
}
