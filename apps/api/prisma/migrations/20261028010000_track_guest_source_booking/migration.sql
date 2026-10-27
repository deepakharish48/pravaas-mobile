ALTER TABLE "HotelGuestQr"
  ADD COLUMN "sourceBookingId" TEXT;

CREATE UNIQUE INDEX "HotelGuestQr_bookingId_sourceBookingId_key"
  ON "HotelGuestQr"("bookingId", "sourceBookingId");

CREATE INDEX "HotelGuestQr_sourceBookingId_idx"
  ON "HotelGuestQr"("sourceBookingId");

ALTER TABLE "HotelGuestQr"
  ADD CONSTRAINT "HotelGuestQr_sourceBookingId_fkey"
  FOREIGN KEY ("sourceBookingId") REFERENCES "Booking"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
