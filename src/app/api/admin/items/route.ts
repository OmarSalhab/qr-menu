import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma, Category } from "@prisma/client";

// GET /api/admin/items
// Query params: page=1, perPage=10, category=MEALS, minPrice, maxPrice, search
export async function GET(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("perPage") || 10)));
  const categoryParam = url.searchParams.get("category");
  const category = (categoryParam as Category | null) || undefined;
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const search = url.searchParams.get("search") || undefined;

    const where: Prisma.ItemWhereInput = { storeId };
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ] as const);

    return NextResponse.json({ items, total, page, perPage });
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
    const data: Prisma.ItemUncheckedCreateInput = {
      name: String(body.name || "").trim(),
      description: body.description ? String(body.description) : null,
      price: Number(body.price),
      currency: String(body.currency || "JD"),
      imageUrl: String(body.imageUrl || ""),
      available: Boolean(body.available ?? true),
      category: String(body.category) as Prisma.ItemUncheckedCreateInput["category"],
      storeId,
    } as const;
    if (!data.name || !data.imageUrl || !data.price || !data.category) {
      return NextResponse.json({ error: "حقول مفقودة" }, { status: 400 });
    }
    const item = await prisma.item.create({ data });
    return NextResponse.json({ item });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
