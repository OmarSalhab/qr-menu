# API Reference

All admin APIs are JSON over HTTP under `/api/admin/*`. Authentication: session cookie (password login). Public root page SSR fetches directly via Prisma, not a public JSON API (could be added later).

Error format (typical): `{ "error": "Message" }` with appropriate HTTP status.

## Authentication

### POST /api/admin/login
Request: `{ password: string }`
Response: `200 { success: true }` sets auth cookie, or `401`.

### POST /api/admin/logout
Clears session.

## Store

### GET /api/admin/store
Returns the single store config.
Response:
```
{
  store: {
    id, name, description, brandColor, bannerUrl, logoUrl,
    timezone, workingHours, themeMode, fontStyle,
    ...social/contact fields (nullable)
  }
}
```

### PATCH /api/admin/store
Request body (partial, validated server-side):
```
{
  name, description, brandColor, bannerUrl, logoUrl,
  timezone, workingHours, themeMode, fontStyle,
  instagramUrl?, whatsappUrl?, facebookUrl?, xUrl?, googleReviewsUrl?, googleMapsUrl?, phone?, email?, website?
}
```
Response: `200 { store: {...} }`

## Categories

### GET /api/admin/categories
Query params: none.
Response:
```
{
  categories: [{ id, name, display, order, counts? }]
}
```
`counts` present only when using endpoints that include `_count` (admin CRUD listing).

### POST /api/admin/categories
Request: `{ display: string }`
Behavior: Normalizes to internal `name` slug, assigns incremental `order`.
Response: `201 { category: { ... } }`
Errors: 409 if duplicate (same normalized name for store).

### PATCH /api/admin/categories/:id
Request: `{ display?: string; order?: number }`
Response: updated category.

### DELETE /api/admin/categories/:id
Blocked if category has related items or specials (checked via counts). Returns `400` with error message.

## Items

### GET /api/admin/items
Query params:
- `page` (default 1)
- `perPage` (default 10)
- `categoryId` (optional)
- `search` (substring match on name)
Response:
```
{
  items: [ { id, name, description, price, currency, imageUrl, available, categoryId, categoryName } ],
  total, page, perPage
}
```

### POST /api/admin/items
Request:
```
{
  name, description?, price, currency?, imageUrl,
  available?, categoryId?
}
```
Response: `201 { item: {..., categoryName } }`

### PATCH /api/admin/items/:id
Request: any subset of item fields.
Response: updated item object.

### DELETE /api/admin/items/:id
Removes item.

## Special Offers

### GET /api/admin/special-items
Query params:
- `page`, `perPage`
- `categoryId?`
- `activeOnly?=true` (filters by current time window and `available=true`)
- `search?`
Response shape parallels items:
```
{
  items: [ { id, name, price, prevPrice, currency, imageUrl, categoryId, categoryName, dateFrom, dateTo, available } ],
  total, page, perPage
}
```

### POST /api/admin/special-items
```
{
  name, description?, price, prevPrice, currency?, imageUrl,
  available?, categoryId, dateFrom, dateTo
}
```
Dates: ISO timestamps (string) accepted; API parses to Date.

### PATCH /api/admin/special-items/:id
Any mutable field subset. Returns updated entity.

### DELETE /api/admin/special-items/:id
Deletes offer.

## Upload

### POST /api/admin/upload
Multipart form-data:
- `file` (binary)
- `filename` (string)

Validates + stores to R2, returns JSON `{ url }`. Old images may be cleaned up at PATCH time of items/specials (implementation detail in upload/delete logic in `r2.ts`).

## Brand (Public Branding Endpoint)

### GET /api/brand
Lightweight endpoint to return theme/font for early streaming or edge consumption.
Response:
```
{ brandColor, themeMode, fontStyle }
```

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (rare) |
| 400 | Validation / business rule error |
| 401 | Unauthorized (login required) |
| 404 | Not found |
| 409 | Conflict (duplicate category, etc.) |
| 500 | Unhandled server error |

## Pagination Pattern

- Input: `page` (1-based), `perPage` (10/20/50 recommended)
- Response includes `total`; UI computes `totalPages = ceil(total / perPage)`.

## Filtering & Search

- Category filtering uses `categoryId` (string UUID-like). Omit for all.
- Search does simple case-insensitive `contains` on name (Prisma `contains` with mode insensitive recommended if added).

## Security Considerations

- All admin endpoints require valid session cookie.
- Rate limiting not yet implemented—add middleware (e.g., token bucket) before production scale.
- Input sanitation relies on Prisma parameterization, but additional length/format checks suggested for file names, display names.

## Versioning Strategy

Currently unversioned (`/api/*`). If breaking changes introduced:
- Add `/api/v2/...` while keeping `/api/v1/...` stable for transitional clients.
- Provide deprecation notice in responses (`Deprecation` header) for old endpoints.

---
See `data-model.md` for schema details and `theming-fonts.md` for presentation pipeline.
