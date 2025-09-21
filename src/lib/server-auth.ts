import { cookies } from "next/headers";
import { parseSessionCookie, sessionCookieName, type SessionPayload } from "@/lib/auth";

export async function requireAdminSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(sessionCookieName)?.value;
  const session = await parseSessionCookie(cookie);
  if (!session) {
    // Keep simple: throw; API routes will catch and respond 401
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
