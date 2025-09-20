import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    if (!username || !password) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { username } });
    if (!store || store.password !== password) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

  const cookie = await createSessionCookie({ sub: store.id, username: store.username });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: cookie.expires,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
