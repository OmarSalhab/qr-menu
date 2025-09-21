import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma, Category } from "@prisma/client";

// PATCH /api/admin/items/[id]
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await _req.json();
    const { id } = await params;
    const data: Prisma.ItemUpdateInput = {};
    if ("name" in body) data.name = String(body.name);
    if ("description" in body) data.description = body.description ? String(body.description) : null;
    if ("price" in body) data.price = Number(body.price);
    if ("currency" in body) data.currency = String(body.currency || "JD");
    if ("imageUrl" in body) data.imageUrl = String(body.imageUrl || "");
    if ("available" in body) data.available = Boolean(body.available);
  if ("category" in body) data.category = String(body.category) as unknown as Category;

  const updated = await prisma.item.update({ where: { id, storeId }, data });
    return NextResponse.json({ item: updated });
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
    await prisma.item.delete({ where: { id, storeId } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
