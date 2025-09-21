import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma, Category } from "@prisma/client";

// GET /api/admin/special-items
// Query: page, perPage, category, activeOnly, search
export async function GET(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("perPage") || 10)));
    const categoryParam = url.searchParams.get("category");
    const category = (categoryParam as Category | null) || undefined;
    const activeOnly = url.searchParams.get("activeOnly") === "true";
    const search = url.searchParams.get("search") || undefined;

    const now = new Date();
    const where: Prisma.SpecialItemWhereInput = { storeId };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (activeOnly) {
      where.AND = [
        { available: true },
        { dateFrom: { lte: now } },
        { dateTo: { gte: now } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.specialItem.count({ where }),
      prisma.specialItem.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    ] as const);

    return NextResponse.json({ items, total, page, perPage });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST /api/admin/special-items
export async function POST(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const description = body.description ? String(body.description) : null;
    const price = parseFloat(String(body.price));
    const prevPrice = parseFloat(String(body.prevPrice));
    const currency = String(body.currency || "JD");
    const imageUrl = String(body.imageUrl || "");
    const available = Boolean(body.available ?? true);
    const category = String(body.category) as Category;
    const dateFrom = new Date(String(body.dateFrom));
    const dateTo = new Date(String(body.dateTo));

    if (!name || !imageUrl || !category || !Number.isFinite(price) || !Number.isFinite(prevPrice) || isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      return NextResponse.json({ error: "حقول مفقودة أو غير صالحة" }, { status: 400 });
    }

    const item = await prisma.specialItem.create({
      data: { name, description, price, prevPrice, currency, imageUrl, available, category, dateFrom, dateTo, storeId },
    });
    return NextResponse.json({ item });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
