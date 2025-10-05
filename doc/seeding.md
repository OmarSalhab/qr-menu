# Seeding & Environment Bootstrap

## Purpose
Provide deterministic starter data (store config, categories, sample items, specials) for local development & demo deployments.

## Existing Scripts
Located in `scripts/`:
- `seed-store.mjs` – Creates the store with branding & working hours.
- `seed-items.mjs` – Adds sample categories/items (needs update to dynamic categories if not already adjusted).

## Recommended Category Bootstrap
Ensure at least one category to avoid empty UI edge cases.

Example adjusted seeding logic:
```javascript
// scripts/seed-categories.mjs
import { prisma } from "../src/lib/prisma.js"; // adjust path if ESM/CJS differences

async function main() {
  const store = await prisma.store.findFirst();
  if (!store) throw new Error("Run seed-store first");
  const base = [
    { name: "meals", display: "وجبات" },
    { name: "snacks", display: "سناكات" },
    { name: "desserts", display: "حلويات" },
    { name: "drinks", display: "مشروبات" },
  ];
  for (let i = 0; i < base.length; i++) {
    const { name, display } = base[i];
    await prisma.categoryModel.upsert({
      where: { storeId_name: { storeId: store.id, name } },
      update: { display, order: i },
      create: { storeId: store.id, name, display, order: i }
    });
  }
}

main().then(() => { console.log("Categories seeded"); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
```

## Linking Items to Categories
After categories inserted, an item seed can map by `name`:
```javascript
const cat = await prisma.categoryModel.findFirst({ where: { storeId: store.id, name: "meals" } });
await prisma.item.create({ data: { storeId: store.id, name: "دجاج مشوي", price: 7.5, imageUrl: "https://...", categoryId: cat.id } });
```

## Special Offers Seed Example
```javascript
const now = new Date();
const tomorrow = new Date(Date.now() + 24*60*60*1000);
await prisma.specialItem.create({
  data: {
    storeId: store.id,
    name: "خصم البطاطا",
    description: "عرض محدود",
    price: 2.0,
    prevPrice: 3.0,
    currency: "JD",
    imageUrl: "https://...",
    available: true,
    categoryId: snacksCat.id,
    dateFrom: now,
    dateTo: tomorrow,
  }
});
```

## Running Seeds
Development:
```bash
node scripts/seed-store.mjs
node scripts/seed-categories.mjs
node scripts/seed-items.mjs   # adjust to set categoryId
```
Add `package.json` convenience script:
```json
"scripts": {
  "seed": "node scripts/seed-store.mjs && node scripts/seed-categories.mjs && node scripts/seed-items.mjs"
}
```

## Idempotency Guidelines
- Use `upsert` for categories.
- Guard store creation (`findFirst` then create if absent).
- Avoid generating duplicate items by name+store (optional unique constraint if desired).

## Environment Variables Recap
| Var | Purpose |
|-----|---------|
| DATABASE_URL | Postgres connection string |
| ADMIN_PASSWORD | Admin panel password (plaintext; consider hashing) |
| R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY | R2 credentials |
| R2_BUCKET / R2_ENDPOINT / R2_PUBLIC_BASE | Storage configuration |

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Items missing category tabs | Categories not seeded | Run category seed before items |
| Specials not appearing | Dates outside current window | Adjust `dateFrom/dateTo` |
| Hydration warning on home | Clock difference or missing SSR attributes | Ensure seeds not altering store theme mid-request |

---
Proceed to `operations.md` for deployment & maintenance procedures.
