"use client";
import React from "react";
import { useCart } from "@/contexts/CartContext";

function QtyControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="btn ghost h-9 w-9" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <div className="min-w-8 text-center font-bold">{value}</div>
      <button className="btn h-9 w-9" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export default function CalculatorPanel() {
  const { items, lines, people, incPeople, decPeople, setQty, closeCart, totalAmount } = useCart();
  const itemById = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const perPerson = people > 0 ? totalAmount / people : totalAmount;

  return (
    <section className="px-5 mt-10 animate-slide-down">
      <div className="text-center text-sm text-[var(--muted)]">احسب فاتورتك المتوقعة قبل الطلب – اختر الكميات واقسم المبلغ على أصدقائك</div>
      <div className="mt-3 card p-4 elevate-sm rounded-[16px]">
        <div className="text-lg font-bold mb-3">العناصر المختارة</div>
        <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
          {lines.length === 0 && (
            <div className="text-sm text-[var(--muted)]">لم يتم إضافة أي عنصر بعد. أضف عناصر من القائمة، ثم افتح السلة لمشاهدة الحاسبة.</div>
          )}
          {lines.map((l) => {
            const it = itemById.get(l.id);
            if (!it) return null;
            return (
              <div key={l.id} className="flex items-center justify-between border-b last:border-b-0 border-[var(--border)] pb-3">
                <div>
                  <div className="font-bold">{it.name}</div>
                  <div className="text-[var(--muted)] text-sm">{it.price.toFixed(2)} {it.currency ?? "JD"}</div>
                </div>
                <QtyControl value={l.qty} onChange={(v) => setQty(l.id, v)} />
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 h-[1px] bg-[var(--border)]" />

        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <div className="text-sm text-[var(--muted)]">عدد الأشخاص</div>
            <div className="flex items-center gap-2 mt-2">
              <button className="btn h-10 w-10" onClick={decPeople}>−</button>
              <div className="h-10 min-w-12 px-4 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-lg font-extrabold">
                {people}
              </div>
              <button className="btn h-10 w-10" onClick={incPeople}>+</button>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-[var(--muted)]">الإجمالي المتوقع</div>
            <div className="text-3xl font-extrabold mt-1">{totalAmount.toFixed(2)} <span className="text-base">JD</span></div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="text-sm text-[var(--muted)]">حصة الشخص الواحد</div>
          <div className="text-right text-2xl font-extrabold">{perPerson.toFixed(2)} <span className="text-sm">JD</span></div>
        </div>

        <div className="mt-3 text-xs text-[var(--muted)]">
          الأرقام أعلاه تقريبية وتساعدك على معرفة تكلفة طلبك قبل تأكيده. قد تختلف القيمة النهائية بناءً على العروض أو الضرائب.
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn ghost h-10" onClick={closeCart}>إغلاق</button>
        </div>
      </div>
    </section>
  );
}
