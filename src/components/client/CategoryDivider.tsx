"use client";
import React from "react";

export default function CategoryDivider({ title }: { title: string }) {
  return (
    <div className="mt-8 mb-3 px-5">
      <div className="flex items-center gap-3 text-[var(--text)]/70">
        <div className="flex-1 border-t border-[var(--border)]" />
        <div className="text-lg font-bold">{title}</div>
      </div>
    </div>
  );
}
