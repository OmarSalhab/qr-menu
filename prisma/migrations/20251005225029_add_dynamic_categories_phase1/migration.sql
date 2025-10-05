-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "public"."SpecialItem" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."CategoryModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryModel_storeId_order_idx" ON "public"."CategoryModel"("storeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryModel_storeId_name_key" ON "public"."CategoryModel"("storeId", "name");

-- AddForeignKey
ALTER TABLE "public"."CategoryModel" ADD CONSTRAINT "CategoryModel_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."CategoryModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecialItem" ADD CONSTRAINT "SpecialItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."CategoryModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
