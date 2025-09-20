"use client";
import React from "react";
import TopNav from "@/components/header/TopNav";
import StoreHeader from "@/components/header/StoreHeader";
import Sidebar from "@/components/layout/Sidebar";
import DeliveryBanner from "@/components/client/DeliveryBanner";
import BranchSelector from "@/components/client/BranchSelector";
import RatingCard from "@/components/client/RatingCard";

export default function Home() {
  const [open, setOpen] = React.useState(false);
  return (
    <main className="mx-auto max-w-screen-sm rtl">
      <TopNav onMenu={() => setOpen(true)} />
      <StoreHeader
        bannerUrl="/file.svg"
        logoUrl="/next.svg"
        name="منيو إنوفا سوفتوير"
        branch="طعم لا يعلى عليه"
        status="closed"
        opensIn="يفتح 1 بعد أيام"
      />
      <div className="p-6">
        {/* Placeholder for tabs as in screenshot */}
        <div className="mt-4 grid grid-cols-4 text-center text-[15px] text-[var(--muted)]">
          <div className="py-3 border-b-2 border-transparent">المشروبات</div>
          <div className="py-3 border-b-2 border-transparent">الحلويات</div>
          <div className="py-3 border-b-2 border-transparent">سناكّي</div>
          <div className="py-3 border-b-2 border-[var(--brand-600)] text-[var(--text)] font-bold">الوجبات</div>
        </div>
      </div>

      <DeliveryBanner />
      <BranchSelector />
      <RatingCard />

      <Sidebar open={open} onClose={() => setOpen(false)} title="القائمة">
        <nav className="space-y-3">
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">لوحة التحكم</a>
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">الطلبات</a>
          <a className="block py-2 px-3 rounded hover:bg-[var(--surface-2)]" href="#">الإعدادات</a>
        </nav>
      </Sidebar>
    </main>
  );
}
