"use client";
import React from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { computeOpenStatus, type WorkingHours } from "@/lib/working-hours";

type Props = {
  bannerUrl?: string;
  logoUrl?: string;
  name: string;
  branch?: string;
  schedule?: { timezone: string; workingHours?: WorkingHours | null };
};

export default function StoreHeader({
  bannerUrl = "/window.svg",
  logoUrl = "/vercel.svg",
  name,
  branch,
  schedule,
}: Props) {
  const open = React.useMemo(() => {
    if (schedule?.workingHours && schedule.workingHours.length > 0) {
      return computeOpenStatus(schedule.workingHours, schedule.timezone || "Asia/Amman");
    }
    return null;
  }, [schedule?.workingHours, schedule?.timezone]);

  return (
    <section className="relative pt-[68px]">{/* pad for TopNav */}
      {/* Cover banner */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <img
          src={bannerUrl}
          alt="صورة الغلاف"
          sizes="100vw"
          className="object-cover object-center"
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
            <img src={logoUrl} alt="الشعار" className=" rounded-2xl w-[112px] h-[112px] border border-[var(--border)]" />
            {open && !open.isOpen && (
              <div className="absolute -top-3 -left-3 rotate-[-20deg]">
                <span className="badge danger">مغلق</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info bar under banner */}
      <div className="px-6 mt-8">
        {open?.label && (
          <div className="text-[var(--muted)] text-sm">{open.label}</div>
        )}
        <h1 className="text-3xl font-extrabold mt-2">{name}</h1>
        {branch && (
          <div className="text-[var(--muted)] text-base mt-1">{branch}</div>
        )}
      </div>
    </section>
  );
}
