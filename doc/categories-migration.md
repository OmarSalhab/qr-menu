# Dynamic Categories Migration

## Background
Originally, categories were an enum baked into the Prisma schema (`MEALS`, `SNACKS`, etc.). To enable arbitrary Arabic category editing (e.g., adding *شيشة*), a new model `CategoryModel` was introduced and relational `categoryId` fields added to `Item` and `SpecialItem`.

Phase 1 (Completed):
- Add `CategoryModel` table.
- Add nullable `categoryId` foreign keys to `Item`, `SpecialItem`.
- Update all APIs/Admin UI to use dynamic categories.
- Keep legacy enum field only for backward compatibility (if still present in DB) but stop referencing it in code.

Phase 2 (Planned):
- Enforce non-null `categoryId` once all rows backfilled.
- Drop legacy enum columns.
- Remove transitional logic (already mostly gone).

## Phase 1 Steps Summary
1. Prisma migration added `CategoryModel` & `categoryId`.
2. Admin endpoints rewired (`/api/admin/items`, `/api/admin/special-items`).
3. Client SSR switched to query category model list.
4. Seed scripts pending update to insert default categories.

## Backfill Approach
If any rows created before dynamic categories have null `categoryId`, backfill them:
```typescript
import { prisma } from "@/lib/prisma";

async function backfill() {
  const store = await prisma.store.findFirst();
  if (!store) return;
  const defaultCat = await prisma.categoryModel.upsert({
    where: { storeId_name: { storeId: store.id, name: "uncategorized" } },
    update: {},
    create: { storeId: store.id, name: "uncategorized", display: "متنوع", order: 999 }
  });
  await prisma.item.updateMany({ where: { storeId: store.id, categoryId: null }, data: { categoryId: defaultCat.id } });
  await prisma.specialItem.updateMany({ where: { storeId: store.id, categoryId: null }, data: { categoryId: defaultCat.id } });
}
backfill();
```

## Phase 2 Migration Script Example
After verifying no nulls:
```sql
-- Example SQL (adjust table names to actual)
ALTER TABLE "Item" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "SpecialItem" ALTER COLUMN "categoryId" SET NOT NULL;
-- If legacy enum column still exists (e.g., category):
ALTER TABLE "Item" DROP COLUMN "category";
ALTER TABLE "SpecialItem" DROP COLUMN "category";
```
Run via Prisma by editing `schema.prisma` then `npx prisma migrate dev --name phase2_category_enforcement`.

## Validation Rules (API Layer)
| Rule | Reason |
|------|--------|
| Category must exist before assigning | Avoid orphaned foreign key (defense if DB constraint absent) |
| Cannot delete category with items/specials | Preserve referential integrity |
| Order default incremental | Simple stable tab ordering |

## Fallback Display
If an item is missing `categoryId` (temporary), UI can bucket under a pseudo category "أخرى" though current design aims to eliminate this state before Phase 2.

## Testing Checklist
- Create new category → appears in list & tab ordering correct.
- Rename category → existing items reflect new display.
- Delete category with zero items/specials → succeeds.
- Attempt delete with references → blocked with error toast.
- Create item with category → list shows `categoryName`.
- Special offers filtered by selected category.

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Concurrent reordering future feature may conflict with new inserts | Implement explicit reorder endpoint with transactional writes |
| Large number of categories slowing tabs | Add horizontal scroll / virtualization |

---
Return to `seeding.md` to update initial data population.
