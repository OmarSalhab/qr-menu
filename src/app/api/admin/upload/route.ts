import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "ملف مفقود" }, { status: 400 });

    const filename = String(form.get("filename") || "upload");
    const contentType = file.type || undefined;
    const now = Date.now();
    const key = `uploads/${now}-${filename}`;
    const arrayBuf = await file.arrayBuffer();
    const url = await uploadToR2(key, arrayBuf, contentType);
    return NextResponse.json({ url, key });
  } catch {
    return NextResponse.json({ error: "فشل الرفع" }, { status: 500 });
  }
}
