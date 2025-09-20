"use client";
import Image from "next/image";
import React from "react";
import Button from "@/components/ui/Button";

type Props = {
  bannerUrl?: string;
  logoUrl?: string;
  name: string;
  branch?: string;
  status?: "open" | "closed" | "soon";
  opensIn?: string; // e.g., "يفتح بعد 1 أيام"
};

export default function StoreHeader({
  bannerUrl = "/window.svg",
  logoUrl = "/vercel.svg",
  name,
  branch,
  status = "closed",
  opensIn,
}: Props) {
  return (
    <section className="relative pt-[68px]">{/* pad for TopNav */}
      {/* Cover banner */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <Image
          src={bannerUrl}
          alt="صورة الغلاف"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />

        {/* Call button */}
        <div className="absolute left-4 bottom-6">
          <Button className="rounded-[14px] bg-[var(--brand-700)] hover:bg-[var(--brand-800)] px-6 h-12 text-base elevate-md">
            اتصل بنا ☎
          </Button>
        </div>

        {/* Status badge on card/ logo */}
        <div className="absolute -bottom-9 right-6">
          <div className="relative bg-white rounded-2xl w-[112px] h-[112px] border border-[var(--border)] flex items-center justify-center elevate-md">
            <Image src={logoUrl} alt="الشعار" width={64} height={64} />
            {status === "closed" && (
              <div className="absolute -top-3 -left-3 rotate-[-20deg]">
                <span className="badge danger">Closed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info bar under banner */}
      <div className="px-6 mt-8">
        {opensIn && (
          <div className="text-[var(--muted)] text-sm">{opensIn}</div>
        )}
        <h1 className="text-3xl font-extrabold mt-2">{name}</h1>
        {branch && (
          <div className="text-[var(--muted)] text-base mt-1">{branch}</div>
        )}
      </div>
    </section>
  );
}
