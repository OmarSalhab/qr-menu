"use client";
import React from "react";
import ItemCard from "@/components/client/ItemCard";
import CategoryDivider from "@/components/client/CategoryDivider";

// Dynamic categories + items are now provided via props (fetched server-side)
export type DynamicCategory = { id: string; display: string };
export type DynamicMenuItem = { id: string; name: string; description?: string | null; price: number; currency?: string | null; imageUrl: string; available?: boolean; categoryId: string | null };

interface Props {
  items: DynamicMenuItem[];
  categories: DynamicCategory[];
  activeCategoryId?: string | "all";
}

export default function MenuList({ items, categories, activeCategoryId = "all" }: Props) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, DynamicMenuItem[]>();
    categories.forEach((c) => map.set(c.id, []));
    items.forEach((it) => {
      if (!it.categoryId) return; // skip uncategorized for now
      if (!map.has(it.categoryId)) map.set(it.categoryId, []);
      map.get(it.categoryId)!.push(it);
    });
    return map;
  }, [items, categories]);

  const catList = activeCategoryId === "all" ? categories : categories.filter(c => c.id === activeCategoryId);

  return (
    <div className="mt-4">
      {catList.map((cat) => {
        const list = grouped.get(cat.id) ?? [];
        if (!list.length) return null;
        return (
          <section key={cat.id} className="mb-10">
            <CategoryDivider title={cat.display} />
            <div className="space-y-4 md:space-y-6">
              {list.map((item) => (
                <ItemCard key={item.id} item={{
                  id: item.id,
                  name: item.name,
                  description: item.description || undefined,
                  price: item.price,
                  currency: item.currency || 'JD',
                  imageUrl: item.imageUrl,
                  available: item.available !== false,
                }} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
