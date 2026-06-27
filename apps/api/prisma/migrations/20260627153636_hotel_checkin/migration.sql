-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "hotelCheckedInBy" TEXT,
ADD COLUMN     "identityName" TEXT,
ADD COLUMN     "identityNumber" TEXT,
ADD COLUMN     "identityType" "DocumentType";

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
