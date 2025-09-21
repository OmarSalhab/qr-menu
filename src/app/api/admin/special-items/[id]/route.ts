import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import { isR2PublicUrl, keyFromPublicUrl, deleteFromR2 } from "@/lib/r2";
import type { Category, Prisma } from "@prisma/client";

// PATCH /api/admin/special-items/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await req.json();
    const { id } = await params;
  const data: Prisma.SpecialItemUpdateInput = {};
    if ("name" in body) data.name = String(body.name);
    if ("description" in body) data.description = body.description ? String(body.description) : null;
    if ("price" in body) { const p = parseFloat(String(body.price)); if (Number.isFinite(p)) data.price = p; }
    if ("prevPrice" in body) { const p = parseFloat(String(body.prevPrice)); if (Number.isFinite(p)) data.prevPrice = p; }
    if ("currency" in body) data.currency = String(body.currency || "JD");
    if ("imageUrl" in body) data.imageUrl = String(body.imageUrl || "");
    if ("available" in body) data.available = Boolean(body.available);
    if ("category" in body) data.category = String(body.category) as Category;
    if ("dateFrom" in body) { const d = new Date(String(body.dateFrom)); if (!isNaN(d.getTime())) data.dateFrom = d; }
    if ("dateTo" in body) { const d = new Date(String(body.dateTo)); if (!isNaN(d.getTime())) data.dateTo = d; }

    const existing = await prisma.specialItem.findUnique({ where: { id, storeId } });
    const updated = await prisma.specialItem.update({ where: { id, storeId }, data });
    if (existing?.imageUrl && updated.imageUrl !== existing.imageUrl && isR2PublicUrl(existing.imageUrl)) {
      const key = keyFromPublicUrl(existing.imageUrl);
      if (key) await deleteFromR2(key);
    }
    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE /api/admin/special-items/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.specialItem.findUnique({ where: { id, storeId } });
    await prisma.specialItem.delete({ where: { id, storeId } });
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
