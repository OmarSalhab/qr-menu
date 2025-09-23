import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    const s = (store ?? null) as unknown as {
      brandColor?: string | null;
      themeMode?: "LIGHT" | "DARK" | null;
      fontStyle?: "CLASSIC" | "ELEGANT" | null;
    } | null;
    return NextResponse.json({ brandColor: s?.brandColor || null, themeMode: s?.themeMode || "LIGHT", fontStyle: s?.fontStyle || "CLASSIC" }, {
      headers: {
        // Small caching to reduce load; middleware reads fresh enough
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch {
    return NextResponse.json({ brandColor: null, themeMode: "LIGHT", fontStyle: "CLASSIC" });
  }
}
