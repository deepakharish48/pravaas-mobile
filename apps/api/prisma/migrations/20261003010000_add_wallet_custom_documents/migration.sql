-- Add a label for guest-defined wallet documents and an enum value for custom uploads.
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TABLE "IdentityDocument" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
