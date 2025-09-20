"use client";
import React from "react";
import { menuItems as defaultItems, type MenuItem } from "@/data/menu";

export type CartLine = { id: string; qty: number };

type CartState = {
  items: MenuItem[];
  lines: CartLine[];
  people: number;
  isOpen: boolean;
};

type CartContextValue = CartState & {
  add: (id: string, delta?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string, delta?: number) => void;
  clear: () => void;
  incPeople: () => void;
  decPeople: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalAmount: number;
  totalCount: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children, items = defaultItems }: { children: React.ReactNode; items?: MenuItem[] }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [people, setPeople] = React.useState(1);
  const [isOpen, setOpen] = React.useState(false);

  const itemById = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const totalAmount = React.useMemo(
    () => lines.reduce((acc, l) => acc + (itemById.get(l.id)?.price ?? 0) * l.qty, 0),
    [lines, itemById]
  );
  const totalCount = React.useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);

  const setQty = (id: string, qty: number) =>
    setLines((prev) => {
      const others = prev.filter((l) => l.id !== id);
      if (qty > 0) return [...others, { id, qty }];
      return others;
    });

  const add = (id: string, delta = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id)?.qty ?? 0;
      const next = existing + delta;
      const rest = prev.filter((l) => l.id !== id);
      if (next <= 0) return rest;
      return [...rest, { id, qty: next }];
    });
  };

  const remove = (id: string, delta = 1) => add(id, -delta);
  const clear = () => setLines([]);
  const incPeople = () => setPeople((p) => Math.min(99, p + 1));
  const decPeople = () => setPeople((p) => Math.max(1, p - 1));
  const openCart = () => setOpen(true);
  const closeCart = () => setOpen(false);

  const value: CartContextValue = {
    items,
    lines,
    people,
    isOpen,
    add,
    setQty,
    remove,
    clear,
    incPeople,
    decPeople,
    openCart,
    closeCart,
    totalAmount,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
