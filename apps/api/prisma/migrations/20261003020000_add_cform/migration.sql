CREATE TABLE "CForm" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CForm_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CForm_bookingId_key" ON "CForm"("bookingId");
CREATE INDEX "CForm_bookingId_idx" ON "CForm"("bookingId");

ALTER TABLE "CForm"
  ADD CONSTRAINT "CForm_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
