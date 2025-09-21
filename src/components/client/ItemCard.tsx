/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/contexts/CartContext";

type Props = {
  item: MenuItem;
};

export default function ItemCard({ item }: Props) {
  const { add, openCart } = useCart();
  return (
    <article className="grid grid-cols-[1fr_120px] gap-4 px-5">
      {/* Text block */}
      <div className="flex flex-col justify-center">
        <h3 className="text-xl font-extrabold leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-[var(--muted)] mt-1 text-[13px]">{item.description}</p>
        )}
        <div className="mt-2 text-2xl font-extrabold">
          {item.price.toFixed(2)}
          <span className="text-sm font-extrabold align-super mr-1">{item.currency ?? "JD"}</span>
        </div>
        <div className="mt-3">
          <button
            disabled={item.available === false}
            className={`btn !h-7 !px-2 !text-sm rounded-[10px] ${item.available === false ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => { add(item.id, 1); openCart(); }}
          >
            أضف إلى الفاتورة
          </button>
        </div>
      </div>

      {/* Image block with robust aspect handling */}
      <div className="relative rounded-[12px] overflow-hidden shrink-0 w-[120px] h-[120px] bg-[var(--surface-2)] border border-[var(--border)]">
        <img src={item.imageUrl} alt={item.name}   className="object-fit h-[120px] w-[120px] object-center transition-transform duration-300 will-change-transform hover:scale-[1.03]" />
        {item.available === false && (
          <div className="absolute top-2 right-2 bg-white/90 text-[var(--text)] rounded-full px-3 py-1 text-sm font-bold">نفذت الكمية !</div>
        )}
      </div>
    </article>
  );
}
