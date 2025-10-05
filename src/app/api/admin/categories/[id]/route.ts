import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";

function normalizeName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
}

// PATCH /api/admin/categories/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await req.json();
    const { id } = await params;

    const data: { name?: string; display?: string; order?: number } = {};
    if ("display" in body) {
      const d = String(body.display || "").trim();
      if (!d) return NextResponse.json({ error: "عرض غير صالح" }, { status: 400 });
      data.display = d;
    }
    if ("name" in body) {
      const n = normalizeName(String(body.name || ""));
      if (!n) return NextResponse.json({ error: "اسم غير صالح" }, { status: 400 });
      // uniqueness check
      const exists = await prisma.categoryModel.findFirst({ where: { storeId, name: n, NOT: { id } } });
      if (exists) return NextResponse.json({ error: "اسم الفئة مستخدم" }, { status: 400 });
      data.name = n;
    }
    if ("order" in body) {
      const o = parseInt(String(body.order), 10);
      if (Number.isFinite(o)) data.order = o;
    }

    const updated = await prisma.categoryModel.update({ where: { id, storeId }, data });
    return NextResponse.json({ category: updated });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    if (
      typeof e === "object" &&
      e &&
      "message" in e &&
      (e as { message?: string }).message === "UNAUTHORIZED"
    )
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const { id } = await params;

    const cat = await prisma.categoryModel.findFirst({
      where: { id, storeId },
      include: { _count: { select: { items: true, specialItems: true } } },
    });
    if (!cat) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    if (cat._count.items > 0 || cat._count.specialItems > 0) {
      return NextResponse.json({ error: "لا يمكن حذف فئة تحتوي على عناصر" }, { status: 400 });
    }
    await prisma.categoryModel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e &&
      "message" in e &&
      (e as { message?: string }).message === "UNAUTHORIZED"
    )
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
