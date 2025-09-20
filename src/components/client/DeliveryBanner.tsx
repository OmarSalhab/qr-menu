"use client";
import React from "react";

export default function DeliveryBanner() {
  return (
    <section className="px-5 mt-6 halo animate-slide-down">
      <div className="rounded-[13px] bg-[var(--brand-600)] text-white text-center text-xl font-extrabold py-3 elevate-md shadow-[0_20px_60px_color-mix(in_oklch,_var(--brand-900),_transparent_60%)]">
        يوجد لدينا خدمة توصيل
      </div>
    </section>
  );
}
