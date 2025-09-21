import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/server-auth";
import type { Prisma } from "@prisma/client";
import { defaultWorkingHours, type WorkingHours } from "@/lib/working-hours";

export const runtime = "nodejs";

// GET /api/admin/store
export async function GET() {
  try {
    const { sub: storeId } = await requireAdminSession();
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    // Provide defaults if fields are missing (e.g., production DB not migrated/seeding not applied)
    const s = store as unknown as { timezone?: string; workingHours?: unknown };
    const out = {
      ...store,
      timezone: (s?.timezone as string | undefined) ?? "Asia/Amman",
      workingHours: (s?.workingHours as WorkingHours | undefined) ?? defaultWorkingHours(),
    };
    return NextResponse.json({ store: out });
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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  
  const data: Record<string, unknown> = {};
  if ("name" in b) data["name"] = String(b.name);
  if ("description" in b) data["description"] = b.description ? String(b.description) : null;
  if ("brandColor" in b) data["brandColor"] = String(b.brandColor);
  if ("bannerUrl" in b) data["bannerUrl"] = b.bannerUrl ? String(b.bannerUrl) : null;
  if ("logoUrl" in b) data["logoUrl"] = b.logoUrl ? String(b.logoUrl) : null;
  if ("timezone" in b) data["timezone"] = String((b.timezone as string) || "Asia/Amman");
  if ("workingHours" in b) data["workingHours"] = b.workingHours as unknown;
  const store = await prisma.store.update({ where: { id: storeId }, data: data as unknown as Prisma.StoreUpdateInput });
    return NextResponse.json({ store });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "message" in e && (e as { message?: string }).message === "UNAUTHORIZED")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    // Better error to diagnose prod issues
    console.error("/api/admin/store PATCH error:", e);
  const err = e as { code?: string; name?: string; message?: string };
  const code = err?.code || err?.name || "UNKNOWN";
  const message = err?.message || "حدث خطأ";
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}

