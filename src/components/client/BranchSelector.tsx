"use client";
import React from "react";
import { branches as defaultBranches, Branch } from "@/data/branches";

function ChevronDown({ className = "" }: { className?: string }) {
  return <span className={`${className} text-gray-800 text-4xl`}>▾</span>;
}

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="bg-gray-400 rounded-[18px] p-4 border-4 border-[var(--brand-700)] shadow-[0_10px_30px_rgba(0,0,0,.08)]">
      <div className="rounded-[14px] overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] aspect-[16/10]" />
      <div className="space-y-3 mt-4">
        <div className="h-12 rounded-full border border-[var(--border)] flex items-center justify-between px-4 text-lg">
          <div>{branch.name}</div>
          <div>📍</div>
        </div>
        <a href={branch.gmapsUrl} target="_blank" className="h-12 rounded-full border border-[var(--border)] flex items-center justify-between px-4 text-lg">
          <div>الموقع على قوقل ماب</div>
          <div>🅖</div>
        </a>
        <a href={`tel:${branch.phone}`} className="h-12 rounded-full border border-[var(--border)] flex items-center justify-between px-4 text-lg">
          <div>{branch.phone}</div>
          <div>📞</div>
        </a>
      </div>
    </div>
  );
}

export default function BranchSelector({ list = defaultBranches }: { list?: Branch[] }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Branch>(list[0]);

  return (
    <section className="px-5 mt-6">
      {/* Selector row */}
      <button
        className="w-full h-14 rounded-[14px] bg-white border border-[var(--border)] elevate-sm flex items-center justify-between px-5 text-2xl font-extrabold animate-fade-in"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-gray-800">الأفرع</span>
        <ChevronDown className={`transition-transform   ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Accordion list */}
      <div className={`accordion mt-4 ${open ? "open" : ""}`}>
        <div>
          <div className="space-y-6">
            {list.map((b) => (
              <button key={b.id} className="block w-full text-right" onClick={() => { setCurrent(b); setOpen(false); }}>
                <BranchCard branch={b} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current selection could be used below */}
      <input type="hidden" name="branchId" value={current?.id} />
    </section>
  );
}
