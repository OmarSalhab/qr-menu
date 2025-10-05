import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma } from "@prisma/client";

// GET /api/admin/items
// Query params: page=1, perPage=10, categoryId=<id>, minPrice, maxPrice, search
export async function GET(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("perPage") || 10)));
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const search = url.searchParams.get("search") || undefined;

    const where: Prisma.ItemWhereInput = { storeId };
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      const min = minPrice != null && minPrice !== "" ? parseFloat(minPrice) : undefined;
      const max = maxPrice != null && maxPrice !== "" ? parseFloat(maxPrice) : undefined;
      if (!Number.isNaN(min as number) || !Number.isNaN(max as number)) {
        where.price = {
          ...(min !== undefined && !Number.isNaN(min) ? { gte: min } : {}),
          ...(max !== undefined && !Number.isNaN(max) ? { lte: max } : {}),
        };
      }
    }
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { categoryRef: true },
      }),
    ] as const);

    // Enrich items with categoryName for UI simplicity
    const enriched = items.map((i) => ({ ...i, categoryName: i.categoryRef?.display || null }));
    return NextResponse.json({ items: enriched, total, page, perPage });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST /api/admin/items
export async function POST(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const description = body.description ? String(body.description) : null;
    const price = parseFloat(String(body.price));
    const currency = String(body.currency || "JD");
    const imageUrl = String(body.imageUrl || "");
    const available = Boolean(body.available ?? true);
    const categoryId = body.categoryId ? String(body.categoryId) : "";

    if (!name || !imageUrl || !categoryId || !Number.isFinite(price)) {
      return NextResponse.json({ error: "حقول مفقودة أو سعر غير صالح" }, { status: 400 });
    }

    const cat = await prisma.categoryModel.findFirst({ where: { id: categoryId, storeId } });
    if (!cat) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 400 });

    // Legacy enum field still required; use a stable placeholder (MEALS) until enum removal migration.
    const item = await prisma.item.create({
      data: { name, description, price, currency, imageUrl, available, category: 'MEALS', categoryId: cat.id, storeId },
      include: { categoryRef: true },
    });
    return NextResponse.json({ item: { ...item, categoryName: item.categoryRef?.display || null } });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
