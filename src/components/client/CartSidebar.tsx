"use client";
import React from "react";
import { useCart } from "@/contexts/CartContext";
import CalculatorPanel from "@/components/client/CalculatorPanel";

export default function CartSidebar() {
  const { isOpen, closeCart } = useCart();
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] rounded-t-2xl elevate-md transition-transform duration-300 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="h-1.5 w-16 bg-[var(--border)] rounded-full mx-auto my-3" />
        <CalculatorPanel />
      </div>
    </>
  );
}
