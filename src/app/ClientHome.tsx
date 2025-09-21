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
import WorkingHours from "@/components/client/WorkingHours";
import type { WorkingHours as WH } from "@/lib/working-hours";
import CartSidebar from "@/components/client/CartSidebar";
import { Star, Instagram, Phone, Mail, MapPin, Clock, MessageCircle, UserRound, X as XIcon, Facebook, Ghost } from "lucide-react";

type StoreLite = {
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  timezone?: string | null;
  workingHours?: WH;
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
  const [showWorkingHours, setShowWorkingHours] = React.useState(false);
  return (
    <main className="mx-auto max-w-screen-sm rtl">
      <TopNav onMenu={() => setOpen(true)} />
      <StoreHeader
        bannerUrl={store.bannerUrl || "/file.svg"}
        logoUrl={store.logoUrl || "/next.svg"}
        name={store.name || "المطعم"}
        branch={store.description || ""}
        schedule={{ timezone: store.timezone || "Asia/Amman", workingHours: store.workingHours }}
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

      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        title="القائمة"
      >
        <nav className="space-y-3">
          <button className="w-full text-start" onClick={() => setShowWorkingHours((v) => !v)}>
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Clock size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold text-[var(--text)] mx-4">أوقات العمل</span>
              <span className="ms-2 text-xs text-[var(--muted)] mx-2">انقر للعرض</span>
            </div>
          </button>
          {showWorkingHours && (
            <div className="mt-2 ms-8">
              <WorkingHours workingHours={store.workingHours} timezone={store.timezone || "Asia/Amman"} />
            </div>
          )}

          <a href="#reviews" className="block">
            <div className=" rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Star size={18} className="text-yellow-500 fill-amber-300" />
              </div>
              <span className="font-semibold mx-4">تقييم المحل</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
                <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <div className="bg-gradient-to-bl from-pink-500 via-purple-600 to-orange-500  rounded-xl">
                  <Instagram size={18} className="text-white " />
                </div>
                </div>
              <span className="font-semibold mx-4">انستاغرام</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <MessageCircle size={18} className="text-[#25D366]" />
              </div>
              <span className="font-semibold mx-4">واتسآب</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <XIcon size={18} className="text-white" />
              </div>
              <span className="font-semibold mx-4">تويتر (X)</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Ghost size={18} className="text-[#FFFC00] " />
              </div>
              <span className="font-semibold mx-4">سناب شات</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <div className="bg-gradient-to-bl from-blue-500 via-blue-600 to-blue-500 p-1 rounded-lg">
                  <Facebook size={18} className="text-white " />
                </div>
              </div>
              <span className="font-semibold mx-4">فيسبوك</span>
            </div>
          </a>
          <a href="tel:+962" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Phone size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold mx-4">تلفون</span>
            </div>
          </a>
          <a href="mailto:info@example.com" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Mail size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold mx-4">إيميل</span>
            </div>
          </a>
          <a href="#" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <MapPin size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold mx-4">جوجل ماب</span>
            </div>
          </a>

          {/* Admin as the last button inside the panel */}
          <a href="/admin" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--brand-700)] text-white border border-transparent relative hover:bg-[var(--brand-800)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--brand-600)] border border-[color-mix(in_oklab,var(--brand-600),black_10%)] grid place-items-center">
                <UserRound size={18} />
              </div>
              <span className="font-semibold mx-4">لوحة الإدارة</span>
            </div>
          </a>
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
