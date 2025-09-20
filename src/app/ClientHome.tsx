"use client";
import React from "react";
import TopNav from "@/components/header/TopNav";
import StoreHeader from "@/components/header/StoreHeader";
import Sidebar from "@/components/layout/Sidebar";
import DeliveryBanner from "@/components/client/DeliveryBanner";
import BranchSelector from "@/components/client/BranchSelector";
import RatingCard from "@/components/client/RatingCard";
import MenuList from "@/components/client/MenuList";
import { categories, type MenuCategory, type MenuItem } from "@/data/menu";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartSidebar from "@/components/client/CartSidebar";

type StoreLite = {
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
};

function FloatingCartButton() {
  const { totalCount, totalAmount, openCart } = useCart();
  if (totalCount === 0) return null;
  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 left-6 rounded-full bg-[var(--brand-700)] text-white h-14 px-5 elevate-md shadow-lg flex items-center gap-3 z-40"
      aria-label="فتح الحاسبة"
    >
      <span>السلة</span>
      <span className="font-extrabold">{totalCount}</span>
      <span className="opacity-90 text-sm">{totalAmount.toFixed(2)} JD</span>
    </button>
  );
}

function Inner({ items, store }: { items: MenuItem[]; store: StoreLite }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<MenuCategory>("الوجبات");
  return (
    <main className="mx-auto max-w-screen-sm rtl">
      <TopNav onMenu={() => setOpen(true)} />
      <StoreHeader
        bannerUrl={store.bannerUrl || "/file.svg"}
        logoUrl={store.logoUrl || "/next.svg"}
        name={store.name || "المطعم"}
        branch={store.description || ""}
        status="closed"
        opensIn="يفتح 1 بعد أيام"
      />

      <div className="px-5 pt-3">
        <div className="grid grid-cols-4 text-center text-md text-[var(--muted)]">
          {categories.map((c) => (
            <button
              key={c}
              className={`py-3 border-b-4 ${activeTab === c ? "border-[var(--brand-600)] text-[var(--text)] font-bold" : "border-transparent"}`}
              onClick={() => setActiveTab(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <DeliveryBanner />
      <BranchSelector />
      <RatingCard />

      <MenuList activeCategory={activeTab} items={items} />

      <Sidebar open={open} onClose={() => setOpen(false)} title="القائمة">
        <nav className="space-y-3">
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">لوحة التحكم</a>
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">الطلبات</a>
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">الإعدادات</a>
        </nav>
      </Sidebar>

      <FloatingCartButton />
      <CartSidebar />
    </main>
  );
}

export default function ClientHome({ items, store }: { items: MenuItem[]; store: StoreLite }) {
  return (
    <CartProvider items={items}>
      <Inner items={items} store={store} />
    </CartProvider>
  );
}
