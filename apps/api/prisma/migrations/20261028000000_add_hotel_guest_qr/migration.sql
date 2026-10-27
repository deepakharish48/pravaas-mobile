CREATE TABLE "HotelGuestQr" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "guestName" TEXT NOT NULL,
  "identityType" TEXT,
  "identityName" TEXT,
  "identityNumber" TEXT,
  "qrPayload" TEXT NOT NULL,
  "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkedInAt" TIMESTAMP(3),
  CONSTRAINT "HotelGuestQr_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HotelGuestQr_bookingId_identityNumber_key"
  ON "HotelGuestQr"("bookingId", "identityNumber");
CREATE INDEX "HotelGuestQr_bookingId_idx"
  ON "HotelGuestQr"("bookingId");
ALTER TABLE "HotelGuestQr"
  ADD CONSTRAINT "HotelGuestQr_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
