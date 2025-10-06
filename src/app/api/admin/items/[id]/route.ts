import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import { isR2PublicUrl, keyFromPublicUrl, deleteFromR2 } from "@/lib/r2";
import type { Prisma } from "@prisma/client";

// PATCH /api/admin/items/[id]
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await _req.json();
    const { id } = await params;
  const data: Prisma.ItemUncheckedUpdateInput = {};
    const existing = await prisma.item.findUnique({ where: { id, storeId } });
    if ("name" in body) data.name = String(body.name);
    if ("description" in body) data.description = body.description ? String(body.description) : null;
    if ("price" in body) {
      const p = parseFloat(String(body.price));
      if (Number.isFinite(p)) data.price = p;
    }
    if ("currency" in body) data.currency = String(body.currency || "JD");
    if ("imageUrl" in body) data.imageUrl = String(body.imageUrl || "");
    if ("available" in body) data.available = Boolean(body.available);
    if ("categoryId" in body) {
      const categoryId = body.categoryId ? String(body.categoryId) : "";
      if (categoryId) {
        const cat = await prisma.categoryModel.findFirst({ where: { id: categoryId, storeId } });
        if (!cat) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 400 });
  data.categoryId = categoryId;
      }
    }
  const updated = await prisma.item.update({ where: { id, storeId }, data, include: { categoryRef: true } });
    // If image changed, delete old R2 image to avoid orphaned files
    if (existing?.imageUrl && updated.imageUrl !== existing.imageUrl && isR2PublicUrl(existing.imageUrl)) {
      const key = keyFromPublicUrl(existing.imageUrl);
      if (key) await deleteFromR2(key);
    }
  return NextResponse.json({ item: { ...updated, categoryName: updated.categoryRef?.display || null } });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE /api/admin/items/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.item.findUnique({ where: { id, storeId } });
    await prisma.item.delete({ where: { id, storeId } });
    if (existing?.imageUrl && isR2PublicUrl(existing.imageUrl)) {
      const key = keyFromPublicUrl(existing.imageUrl);
      if (key) await deleteFromR2(key);
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
