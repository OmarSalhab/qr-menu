/* eslint-disable @typescript-eslint/no-explicit-any */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID as string | undefined;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string | undefined;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string | undefined;
const R2_BUCKET = process.env.R2_BUCKET as string | undefined;
// Public dev URL base, e.g., https://pub-xxxx.r2.dev
export const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE as string | undefined;

function ensureEnv() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE) {
    throw new Error("Missing R2 env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE");
  }
}

async function getR2Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(key: string, body: Uint8Array | ArrayBuffer | Blob, contentType?: string): Promise<string> {
  ensureEnv();
  const client = await getR2Client();
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const Body = (body as any);
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET!, Key: key, Body, ContentType: contentType } as any));
  const url = `${R2_PUBLIC_BASE!.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
  return url;
}

export async function deleteFromR2(key: string): Promise<void> {
  ensureEnv();
  const client = await getR2Client();
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET!, Key: key } as any));
}

export function keyFromPublicUrl(url: string): string | null {
  if (!R2_PUBLIC_BASE) return null;
  const base = R2_PUBLIC_BASE.replace(/\/$/, "");
  if (!url.startsWith(base + "/")) return null;
  const key = decodeURIComponent(url.slice(base.length + 1));
  return key;
}

export function isR2PublicUrl(url: string): boolean {
  if (!R2_PUBLIC_BASE) return false;
  const base = R2_PUBLIC_BASE.replace(/\/$/, "");
  return url.startsWith(base + "/");
}
