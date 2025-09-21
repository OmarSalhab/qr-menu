"use client";
import React from "react";
import Button from "@/components/ui/Button";

export default function RatingCard() {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  return (
    <section className="px-5 mt-6 halo animate-slide-down">
      <div className="bg-white rounded-[18px] border-4 border-[var(--brand-700)] p-6 elevate-md relative">
        <button
          aria-label="إغلاق"
          className="absolute top-4 left-4 text-2xl leading-none text-gray-800"
          onClick={() => setVisible(false)}
        >
          ×
        </button>

  <h2 dir="ltr" className="text-2xl md:text-4xl !text-gray-800 font-extrabold text-center" >! قيمنا</h2>
  <div className="mt-6  flex justify-center gap-4 md:gap-6 text-3xl md:text-4xl text-yellow-400/80">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>☆</span>
          ))}
        </div>

        <div dir="ltr" className="mt-7 flex justify-center">
          <Button className="bg-[var(--brand-700)] hover:bg-[var(--brand-800)] rounded-[14px] h-10 md:h-12 text-lg md:text-xl px-6 md:px-8">
            ! اضغط للتقييم
          </Button>
        </div>
      </div>
    </section>
  );
}
