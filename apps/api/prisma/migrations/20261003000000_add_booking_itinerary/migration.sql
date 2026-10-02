-- Add itinerary fields to bookings. IF NOT EXISTS keeps this safe for databases
-- where the columns were already added manually with `prisma db push`.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "destination" TEXT,
  ADD COLUMN IF NOT EXISTS "itineraryData" TEXT;
