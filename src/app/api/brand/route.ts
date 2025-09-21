import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const store = await prisma.store.findFirst({ select: { brandColor: true } });
    return NextResponse.json({ brandColor: store?.brandColor || null }, {
      headers: {
        // Small caching to reduce load; middleware reads fresh enough
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch {
    return NextResponse.json({ brandColor: null });
  }
}
