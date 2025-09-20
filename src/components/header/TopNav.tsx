"use client";
import React from "react";
import Button from "@/components/ui/Button";

type TopNavProps = {
  onMenu: () => void;
};

export default function TopNav({ onMenu }: TopNavProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="mx-auto max-w-screen-sm px-4 pt-4">
        <div className="flex items-center justify-between">
          <Button
            aria-label="القائمة"
            className="rounded-full h-11 w-11 p-0 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] elevate-sm"
            variant="ghost"
            onClick={onMenu}
          >
            ☰
          </Button>

          <a
            href="#bookings"
            className="badge brand text-sm elevate-sm border bg-[var(--brand-600)] text-white hover:opacity-95"
          >
            الحجوزات ◴
          </a>
        </div>
      </div>
    </header>
  );
}
