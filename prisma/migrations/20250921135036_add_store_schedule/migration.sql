-- AlterTable
ALTER TABLE "public"."Store" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Amman',
ADD COLUMN     "workingHours" JSONB;
