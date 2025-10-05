# Images & Storage (Cloudflare R2)

## Overview
R2 serves as S3-compatible object storage for menu and special offer images.

## Upload Flow
1. Admin selects file.
2. UI sends `multipart/form-data` to `/api/admin/upload` with fields: `file`, `filename`.
3. Route uploads to R2 using S3 SDK/compatible client (`r2.ts`).
4. Response JSON: `{ url }` (public URL or signed path depending on configuration).
5. UI uses returned `url` in subsequent POST/PATCH for Items or SpecialItems.

## Old Image Cleanup
When updating an item/special with a new image:
- Fetch existing entity (if needed) to get prior `imageUrl`.
- After successful new upload & DB update, issue delete to R2 for old key (if not referenced elsewhere).

## File Naming Strategy
Recommended (if not yet implemented): `storeId/ITEM_<id>_<timestamp>.ext` to avoid collisions & enable batched cleanup.

## Security
| Aspect | Concern | Mitigation |
|--------|---------|------------|
| Public listing | If bucket is public, all images discoverable | Use randomized filenames (cuid) |
| Oversized files | Large uploads could bloat storage | Enforce size limit in route (check `file.size`) |
| Mime spoofing | Uploading executable disguised as image | Check Content-Type & extension (basic) |

## Potential Enhancements
| Feature | Benefit |
|---------|---------|
| Image resizing variants | Faster mobile load |
| EXIF strip | Privacy & size reduction |
| CDN caching headers | Performance |
| Signed URLs with expiry | Access control |

## Example Pseudocode (Upload Handler)
```typescript
const form = await request.formData();
const file = form.get("file") as File;
const filename = form.get("filename") as string;
const key = `${Date.now()}_${filename}`;
await r2Client.putObject(key, file.stream());
return NextResponse.json({ url: `${CDN_BASE}/${key}` });
```

## Orphaned File Cleanup Strategy
1. Periodic script scans bucket keys older than N days.
2. Cross-reference with DB `imageUrl` fields.
3. Delete missing references. (Add safety allowlist or dry-run first.)

---
Proceed to `seeding.md` for initial data population.
