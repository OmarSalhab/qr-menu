/* eslint-disable @next/next/no-img-element */
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
import { Star, Instagram, Phone, Mail, MapPin, Clock, MessageCircle, UserRound, X as XIcon, Facebook, Ghost, BadgePercent } from "lucide-react";
import { getFallbackLink } from "@/lib/links";

type StoreLite = {
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  timezone?: string | null;
  workingHours?: WH;
  // Optional social/contact links that may or may not exist in the DB yet
  googleReviewsUrl?: string | null;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  xUrl?: string | null; // Twitter/X
  facebookUrl?: string | null;
  googleMapsUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

type SpecialUi = {
  id: string;
  name: string;
  description?: string;
  price: number;
  prevPrice: number;
  currency: string;
  imageUrl: string;
  category: MenuCategory;
  dateFrom: string; // ISO
  dateTo: string;   // ISO
};

function SpecialOffers({ specials, activeCategory }: { specials: SpecialUi[]; activeCategory: MenuCategory }) {
  const filtered = specials.filter((s) => s.category === activeCategory);
  if (filtered.length === 0) return null;
  return (
    <section className="px-5 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <BadgePercent size={18} className="text-[var(--brand-600)]" />
        <h3 className="font-extrabold">عروض خاصة</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((s) => (
          <article key={s.id} className="rounded-xl border border-[var(--border)] overflow-hidden elevate-sm bg-[var(--surface)]">
            <div className="flex">
              <img src={s.imageUrl} alt={s.name} className="w-28 h-28 object-cover" />
              <div className="p-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold leading-tight mb-1">{s.name}</h4>
                    {s.description && <p className="text-[var(--muted)] text-xs line-clamp-2">{s.description}</p>}
                  </div>
                  <div className="text-end">
                    <div className="text-sm text-[var(--muted)] line-through">{s.prevPrice.toFixed(2)} {s.currency}</div>
                    <div className="text-lg font-extrabold text-[var(--brand-700)]">{s.price.toFixed(2)} {s.currency}</div>
                  </div>
                </div>
                <div className="mt-2 text-[var(--muted)] text-xs">
                  صالح من {new Date(s.dateFrom).toLocaleDateString("ar-JO")} حتى {new Date(s.dateTo).toLocaleDateString("ar-JO")}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FloatingCartButton() {
  const { totalCount, totalAmount, openCart } = useCart();
  if (totalCount === 0) return null;
  return (
    <button
      onClick={openCart}
      className="fixed bottom-4 !text-sm left-4 rounded-full bg-[var(--brand-700)] text-white h-10 px-4 elevate-md shadow-lg flex items-center gap-3 z-40"
      aria-label="فتح الحاسبة"
    >
      <span>الفاتورة</span>
      {/* <span className="font-extrabold">{totalCount}</span> */}
      <span className="opacity-90 text-sm">{totalAmount.toFixed(2)} JD</span>
    </button>
  );
}

function Inner({ items, store, specials }: { items: MenuItem[]; store: StoreLite; specials: SpecialUi[] }) {
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

  {/* Special offers under review, above menu items */}
  <SpecialOffers specials={specials} activeCategory={activeTab} />

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

          <a href={store.googleReviewsUrl || getFallbackLink("googleReviews")} target="_blank" className="block">
            <div className=" rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Star size={18} className="text-yellow-500 fill-amber-300" />
              </div>
              <span className="font-semibold mx-4">تقييم المحل</span>
            </div>
          </a>
          <a href={store.instagramUrl || getFallbackLink("instagram")} target="_blank" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
                <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <div className="bg-gradient-to-bl from-pink-500 via-purple-600 to-orange-500  rounded-xl">
                  <Instagram size={18} className="text-white " />
                </div>
                </div>
              <span className="font-semibold mx-4">انستاغرام</span>
            </div>
          </a>
          <a href={store.whatsappUrl || getFallbackLink("whatsapp")} target="_blank" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <MessageCircle size={18} className="text-[#25D366]" />
              </div>
              <span className="font-semibold mx-4">واتسآب</span>
            </div>
          </a>
          <a href={store.xUrl || getFallbackLink("x")} target="_blank" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <XIcon size={18} className="text-white" />
              </div>
              <span className="font-semibold mx-4">تويتر (X)</span>
            </div>
          </a>
          <a href={getFallbackLink("snapchat")} target="_blank" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Ghost size={18} className="text-[#FFFC00] " />
              </div>
              <span className="font-semibold mx-4">سناب شات</span>
            </div>
          </a>
          <a href={store.facebookUrl || getFallbackLink("facebook")} target="_blank" className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <div className="bg-gradient-to-bl from-blue-500 via-blue-600 to-blue-500 p-1 rounded-lg">
                  <Facebook size={18} className="text-white " />
                </div>
              </div>
              <span className="font-semibold mx-4">فيسبوك</span>
            </div>
          </a>
          <a href={store.phone ? `tel:${store.phone}` : getFallbackLink("phone")} className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Phone size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold mx-4">تلفون</span>
            </div>
          </a>
          <a href={store.email ? `mailto:${store.email}` : getFallbackLink("email")} className="block">
            <div className="rounded-[999px] ps-6 pe-10 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] relative hover:border-[var(--brand-400)] transition-colors">
              <div className="absolute -start-2 -top-2 w-10 h-10 rounded-[999px] bg-[var(--surface)] border border-[var(--border)] grid place-items-center">
                <Mail size={18} className="text-[var(--muted)]" />
              </div>
              <span className="font-semibold mx-4">إيميل</span>
            </div>
          </a>
          <a href={store.googleMapsUrl || getFallbackLink("maps")} target="_blank" className="block">
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

export default function ClientHome({ items, store, specials }: { items: MenuItem[]; store: StoreLite; specials: SpecialUi[] }) {
  return (
    <CartProvider items={items}>
      <Inner items={items} store={store} specials={specials} />
    </CartProvider>
  );
}
