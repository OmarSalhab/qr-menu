"use client";
import React from "react";
import type { WorkingHours as WH } from "@/lib/working-hours";

const DAY_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

export default function WorkingHours({ workingHours, timezone }: { workingHours?: WH; timezone: string }) {
  const wh = workingHours || [];
  return (
    <div className="card p-5 rounded-[16px] elevate-md">
      <h3 className="text-xl font-extrabold mb-3">أوقات الدوام</h3>
      <div className="divide-y divide-[var(--border)]">
        {Array.from({ length: 7 }, (_, d) => {
          const row = wh.find((x) => x.day === d);
          const text = !row || row.closed ? "مغلق" : `${row.open} - ${row.close}`;
          return (
            <div key={d} className="flex items-center justify-between py-2">
              <div className="font-semibold">{DAY_AR[d]}</div>
              <div className="text-[var(--muted)]">{text}</div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-[var(--muted)] mt-3">المنطقة الزمنية: {timezone}</div>
    </div>
  );
}
