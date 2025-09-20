// Edge-compatible HMAC cookie signing using Web Crypto (no Node 'crypto' or Buffer)
// Payload: { sub, username, exp }
const SESSION_COOKIE = "qrmenu_session";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-change";
  return secret;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

// Safe base64 helpers usable in Edge and Node
const _btoa = (str: string) =>
  typeof btoa !== "undefined"
    ? btoa(str)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (globalThis as any).Buffer?.from(str, "binary").toString("base64");
const _atob = (str: string) =>
  typeof atob !== "undefined"
    ? atob(str)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (globalThis as any).Buffer?.from(str, "base64").toString("binary");

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = _btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const binary = _atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSha256Base64Url(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqualBase64Url(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type SessionPayload = {
  sub: string; // store id
  username: string;
  exp: number; // epoch ms
};

export async function createSessionCookie(
  payload: Omit<SessionPayload, "exp">,
  ttlMs = DEFAULT_TTL_MS
) {
  const exp = Date.now() + ttlMs;
  const data: SessionPayload = { ...payload, exp };
  const body = toBase64Url(enc.encode(JSON.stringify(data)));
  const sig = await hmacSha256Base64Url(body, getSecret());
  const value = `${body}.${sig}`;
  return { name: SESSION_COOKIE, value, expires: new Date(exp) } as const;
}

export async function parseSessionCookie(value: string | undefined): Promise<SessionPayload | null> {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256Base64Url(body, getSecret());
  if (!timingSafeEqualBase64Url(sig, expected)) return null;
  const jsonStr = dec.decode(fromBase64UrlToBytes(body));
  const json = JSON.parse(jsonStr);
  if (Date.now() > json.exp) return null;
  return json as SessionPayload;
}

export const sessionCookieName = SESSION_COOKIE;
