import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma } from "@prisma/client";

// GET /api/admin/store
export async function GET() {
  try {
    const { sub: storeId } = await requireAdminSession();
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    return NextResponse.json({ store });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// PATCH /api/admin/store
export async function PATCH(req: Request) {
  try {
    const { sub: storeId } = await requireAdminSession();
  const body = await req.json();
  console.log(body);
  
  const data: Record<string, unknown> = {};
  if ("name" in body) data["name"] = String(body.name);
  if ("description" in body) data["description"] = body.description ? String(body.description) : null;
  if ("brandColor" in body) data["brandColor"] = String(body.brandColor);
  if ("bannerUrl" in body) data["bannerUrl"] = body.bannerUrl ? String(body.bannerUrl) : null;
  if ("logoUrl" in body) data["logoUrl"] = body.logoUrl ? String(body.logoUrl) : null;
  if ("timezone" in body) data["timezone"] = String(body.timezone || "Asia/Amman");
  if ("workingHours" in body) data["workingHours"] = body.workingHours as unknown;
  const store = await prisma.store.update({ where: { id: storeId }, data: data as unknown as Prisma.StoreUpdateInput });
    return NextResponse.json({ store });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
