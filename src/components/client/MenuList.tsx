"use client";
import React from "react";
import ItemCard from "@/components/client/ItemCard";
import CategoryDivider from "@/components/client/CategoryDivider";
import { categories, menuItems, type MenuCategory, type MenuItem } from "@/data/menu";

type Props = {
  items?: MenuItem[];
  activeCategory?: MenuCategory | "الكل";
};

export default function MenuList({ items = menuItems, activeCategory = "الكل" }: Props) {
  // Group by category
  const grouped = React.useMemo(() => {
    const map = new Map<MenuCategory, MenuItem[]>();
    categories.forEach((c) => map.set(c, []));
    items.forEach((it) => {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category)!.push(it);
    });
    return map;
  }, [items]);

  return (
    <div className="mt-4">
      {(activeCategory === "الكل" ? categories : [activeCategory]).map((cat) => {
        const list = grouped.get(cat) ?? [];
        if (!list.length) return null;
        return (
          <section key={cat} className="mb-10">
            <CategoryDivider title={cat} />
            <div className="space-y-4 md:space-y-6">
              {list.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
