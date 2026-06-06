import { Booking, BookingStatus } from "@prisma/client";

export function formatBooking(booking: Booking) {
  return {
    id: booking.id,
    userId: booking.userId,
    imagePath: booking.imagePath,
    hotelName: booking.hotelName,
    guestName: booking.guestName,
    checkIn: booking.checkIn?.toISOString() ?? null,
    checkOut: booking.checkOut?.toISOString() ?? null,
    confirmationNumber: booking.confirmationNumber,
    roomType: booking.roomType,
    numberOfGuests: booking.numberOfGuests,
    totalPrice: booking.totalPrice,
    currency: booking.currency,
    rawExtractedData: booking.rawExtractedData,
    status: booking.status as BookingStatus,
    qrCode: booking.qrCode,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}
