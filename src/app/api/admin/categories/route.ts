import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";

// Helper to normalize internal category name (slug-like)
function normalizeName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40); // limit length
}

// GET /api/admin/categories?includeCounts=true
export async function GET(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const url = new URL(req.url);
    const includeCounts = url.searchParams.get("includeCounts") === "true";

    const categories = await prisma.categoryModel.findMany({
      where: { storeId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: includeCounts
        ? { _count: { select: { items: true, specialItems: true } } }
        : undefined,
    });

    const result = categories.map((c) => {
      const base = {
        id: c.id,
        name: c.name,
        display: c.display,
        order: c.order,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
      if (includeCounts && "_count" in c) {
        const count = (c as typeof c & { _count: { items: number; specialItems: number } })._count;
        return { ...base, counts: { items: count.items, specialItems: count.specialItems } };
      }
      return base;
    });

    return NextResponse.json({ categories: result });
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

// POST /api/admin/categories
// Body: { name (optional - will derive from display if missing), display, order? }
export async function POST(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await req.json();
    const rawDisplay = String(body.display || "").trim();
    if (!rawDisplay) {
      return NextResponse.json({ error: "الاسم الظاهر مطلوب" }, { status: 400 });
    }
  const rawName = body.name ? String(body.name) : rawDisplay;
  let name = normalizeName(rawName);
    if (!name) name = normalizeName("cat" + Date.now());

    // Ensure unique within store
    const existing = await prisma.categoryModel.findFirst({ where: { storeId, name } });
    if (existing) return NextResponse.json({ error: "اسم الفئة مستخدم" }, { status: 400 });

    // Determine order
    let order: number;
    if (body.order != null && body.order !== "") {
      const o = parseInt(String(body.order), 10);
      order = Number.isFinite(o) ? o : 0;
    } else {
      const last = await prisma.categoryModel.findFirst({ where: { storeId }, orderBy: { order: "desc" } });
      order = last ? last.order + 1 : 0;
    }

    const created = await prisma.categoryModel.create({
      data: { name, display: rawDisplay, order, storeId },
    });
    return NextResponse.json({ category: created });
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
