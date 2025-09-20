"use client";
import React from "react";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
};

export default function Sidebar({ open, onClose, title, children }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-[88vw] max-w-[420px] bg-[var(--surface)] border-s border-[var(--border)] z-50 transition-transform duration-300 ease-out elevate-md ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="font-bold text-lg">{title}</div>
          <button aria-label="إغلاق" className="btn ghost h-9 px-3" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">{children}</div>
      </aside>
    </>
  );
}
