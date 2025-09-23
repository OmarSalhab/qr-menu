-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "public"."FontStyle" AS ENUM ('CLASSIC', 'ELEGANT');

-- AlterTable
ALTER TABLE "public"."Store" ADD COLUMN     "fontStyle" "public"."FontStyle" NOT NULL DEFAULT 'CLASSIC',
ADD COLUMN     "themeMode" "public"."ThemeMode" NOT NULL DEFAULT 'LIGHT';
