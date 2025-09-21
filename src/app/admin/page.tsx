"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { WorkingHours as WH } from "@/lib/working-hours";
import { useRouter } from "next/navigation";
import type { Category, Item, Store } from "@prisma/client";

type TabKey = "theme" | "menu" | "offers";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("theme");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <main className="min-h-screen grid grid-cols-12 gap-0 rtl" dir="rtl">
      {/* Right side navigation */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2 border-s border-[var(--border)] bg-[var(--surface-1)] min-h-screen p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold">لوحة التحكم</h2>
          <button onClick={logout} className="btn ghost h-9">خروج</button>
        </div>
        <nav className="space-y-2">
          <button className={`btn w-full justify-start ${tab === "theme" ? "solid" : "ghost"}`} onClick={() => setTab("theme")}>تعديل المظهر</button>
          <button className={`btn w-full justify-start ${tab === "menu" ? "solid" : "ghost"}`} onClick={() => setTab("menu")}>القائمة</button>
          <button className={`btn w-full justify-start ${tab === "offers" ? "solid" : "ghost"}`} onClick={() => setTab("offers")}>العروض الخاصة</button>
        </nav>
      </aside>

      {/* Left wider content */}
      <section className="col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-10 p-6">
        {tab === "theme" && <ThemePanel />}
        {tab === "menu" && <MenuPanel />}
        {tab === "offers" && (
          <div className="card p-6 rounded-[16px] elevate-md">
            <h3 className="text-xl font-extrabold mb-2">العروض الخاصة</h3>
            <p className="text-[var(--muted)]">هذه هي لوحة العروض الخاصة.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function ThemePanel() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; brandColor: string; bannerUrl: string; logoUrl: string; timezone: string; workingHours: WH | null }>({ name: "", description: "", brandColor: "", bannerUrl: "", logoUrl: "", timezone: "Asia/Amman", workingHours: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/store", { cache: "no-store" });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      if (!mounted) return;
      setStore(data.store);
      setForm({
        name: data.store.name || "",
        description: data.store.description || "",
        brandColor: data.store.brandColor || "",
        bannerUrl: data.store.bannerUrl || "",
        logoUrl: data.store.logoUrl || "",
        timezone: data.store.timezone || "Asia/Amman",
        workingHours: (data.store.workingHours as WH) || null,
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function save() {
    setLoading(true);
  const payload: { name: string; description: string; brandColor: string; bannerUrl: string; logoUrl: string; timezone: string; workingHours: WH | null } = { ...form };
  const res = await fetch("/api/admin/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setStore(data.store);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold">تعديل المظهر</h3>
          <p className="text-[var(--muted)]">اسم العلامة، اللون الرئيسي، شعار وبانر المتجر.</p>
        </div>
        <button onClick={save} className="btn h-10" disabled={loading}>حفظ</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 rounded-[16px] elevate-md space-y-4">
          <div>
            <label className="block text-sm mb-1">اسم المتجر</label>
            <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">وصف</label>
            <textarea className="input w-full min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">اللون الرئيسي (CSS oklch أو hex)</label>
            <input className="input w-full" value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">المنطقة الزمنية</label>
              <input className="input w-full" placeholder="مثال: Asia/Amman" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="card p-5 rounded-[16px] elevate-md space-y-4">
          <div>
            <label className="block text-sm mb-1">رابط شعار المتجر</label>
            <input className="input w-full" placeholder="لمعالجة الرفع لاحقاً (R2)" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">رابط صورة البانر</label>
            <input className="input w-full" placeholder="لمعالجة الرفع لاحقاً (R2)" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} />
          </div>
          {store?.brandColor && (
            <div className="rounded-lg p-3 border border-[var(--border)]" style={{ background: store.brandColor }}>
              <div className="text-sm font-bold text-white">معاينة اللون</div>
            </div>
          )}
        </div>
      </div>

      {/* Working hours editor */}
      <div className="card p-5 rounded-[16px] elevate-md space-y-3">
        <h4 className="text-lg font-extrabold">أوقات العمل</h4>
        <p className="text-[var(--muted)] text-sm">حدد وقت الفتح والإغلاق لكل يوم.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 7 }, (_, d) => d).map((d) => {
            const day = form.workingHours?.find((x) => x.day === d) || { day: d, open: "10:00", close: "23:00", closed: false };
            const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            return (
              <div key={d} className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{dayNames[d]}</div>
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={Boolean(day.closed)} onChange={(e) => {
                      const wh = [...(form.workingHours || [])];
                      const idx = wh.findIndex((x) => x.day === d);
                      const updated = { ...day, closed: e.target.checked };
                      if (idx >= 0) wh[idx] = updated; else wh.push(updated);
                      setForm({ ...form, workingHours: wh as WH });
                    }} />
                    مغلق
                  </label>
                </div>
                {!day.closed && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1">يفتح</label>
                      <input className="input w-full" value={day.open} onChange={(e) => {
                        const wh = [...(form.workingHours || [])];
                        const idx = wh.findIndex((x) => x.day === d);
                        const updated = { ...day, open: e.target.value };
                        if (idx >= 0) wh[idx] = updated; else wh.push(updated);
                        setForm({ ...form, workingHours: wh as WH });
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">يغلق</label>
                      <input className="input w-full" value={day.close} onChange={(e) => {
                        const wh = [...(form.workingHours || [])];
                        const idx = wh.findIndex((x) => x.day === d);
                        const updated = { ...day, close: e.target.value };
                        if (idx >= 0) wh[idx] = updated; else wh.push(updated);
                        setForm({ ...form, workingHours: wh as WH });
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type ItemsResponse = { items: Item[]; total: number; page: number; perPage: number };

function MenuPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ category?: Category; minPrice?: string; maxPrice?: string; search?: string }>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", price: "", currency: "JD", imageUrl: "", available: true, category: "MEALS" as Category, description: "" });
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editForm, setEditForm] = useState<Partial<Item>>({});

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (filters.category) qs.set("category", filters.category);
    if (filters.minPrice) qs.set("minPrice", filters.minPrice);
    if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
    if (filters.search) qs.set("search", filters.search);
    const res = await fetch(`/api/admin/items?${qs.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (res.ok) {
      const data: ItemsResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPerPage(data.perPage);
    }
  }, [page, perPage, filters]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => { load(); }, [load, filterKey]);

  async function createItem() {
    const payload = {
      name: createForm.name,
      description: createForm.description,
      price: Number(createForm.price),
      currency: createForm.currency,
      imageUrl: createForm.imageUrl,
      available: createForm.available,
      category: createForm.category,
    };
    const res = await fetch("/api/admin/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setCreateForm({ name: "", price: "", currency: "JD", imageUrl: "", available: true, category: "MEALS" as Category, description: "" });
      load();
    }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function saveEdit() {
    if (!editItem) return;
    const res = await fetch(`/api/admin/items/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    if (res.ok) { setEditItem(null); setEditForm({}); load(); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold">القائمة</h3>
          <p className="text-[var(--muted)]">إدارة عناصر القائمة مع تصفية وترقيم الصفحات.</p>
        </div>
        <button className="btn h-10" onClick={() => setCreateOpen(v => !v)}>{createOpen ? "إخفاء إنشاء عنصر" : "إنشاء عنصر"}</button>
      </header>

      {createOpen && (
        <div className="card p-5 rounded-[16px] elevate-md space-y-4">
          <h4 className="text-lg font-extrabold">عنصر جديد</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">الاسم</label>
              <input className="input w-full" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">السعر</label>
              <input className="input w-full" type="number" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">العملة</label>
              <input className="input w-full" value={createForm.currency} onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">الفئة</label>
              <select className="input w-full" value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as Category })}>
                <option value="MEALS">وجبات</option>
                <option value="SNACKS">سناكات</option>
                <option value="DESSERTS">حلويات</option>
                <option value="DRINKS">مشروبات</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">رابط الصورة</label>
              <input className="input w-full" placeholder="رفع الصورة لاحقاً عبر R2" value={createForm.imageUrl} onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">متاح</label>
              <input type="checkbox" className="mx-2" checked={createForm.available} onChange={(e) => setCreateForm({ ...createForm, available: e.target.checked })} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm mb-1">الوصف</label>
              <textarea className="input w-full min-h-20" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn h-10" onClick={createItem}>حفظ العنصر</button>
          </div>
        </div>
      )}

      <div className="card p-5 rounded-[16px] elevate-md">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input className="input w-full" placeholder="بحث بالاسم" value={filters.search || ""} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
          <select className="input w-full" value={filters.category || ""} onChange={(e) => setFilters({ ...filters, category: (e.target.value || undefined) as Category | undefined })}>
            <option value="">كل الفئات</option>
            <option value="MEALS">وجبات</option>
            <option value="SNACKS">سناكات</option>
            <option value="DESSERTS">حلويات</option>
            <option value="DRINKS">مشروبات</option>
          </select>
          <input className="input w-full" type="number" placeholder="أدنى سعر" value={filters.minPrice || ""} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value || undefined })} />
          <input className="input w-full" type="number" placeholder="أعلى سعر" value={filters.maxPrice || ""} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value || undefined })} />
          <select className="input w-full" value={String(perPage)} onChange={(e) => setPerPage(Number(e.target.value))}>
            <option value="10">10 / صفحة</option>
            <option value="20">20 / صفحة</option>
            <option value="50">50 / صفحة</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--muted)] text-xs">
                <th className="text-start p-2">الاسم</th>
                <th className="text-start p-2">الفئة</th>
                <th className="text-start p-2">السعر</th>
                <th className="text-start p-2">الحالة</th>
                <th className="text-start p-2">عمليات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-[var(--border)]">
                  <td className="p-2 font-medium">{it.name}</td>
                  <td className="p-2">{translateCategory(it.category)}</td>
                  <td className="p-2">{it.price} {it.currency}</td>
                  <td className="p-2">{it.available ? "متاح" : "غير متاح"}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button className="btn ghost h-8" onClick={() => { setEditItem(it); setEditForm(it); }}>تعديل</button>
                    <button className="btn ghost h-8" onClick={() => deleteItem(it.id)}>حذف</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-[var(--muted)]" colSpan={5}>{loading ? "جار التحميل..." : "لا توجد عناصر"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[var(--muted)]">الصفحة {page} من {totalPages}</div>
          <div className="space-x-2 space-x-reverse">
            <button className="btn h-9" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>السابق</button>
            <button className="btn h-9" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>التالي</button>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      {editItem && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditItem(null)} />
          <div className="absolute top-0 bottom-0 right-0 w-[88vw] max-w-[480px] bg-[var(--surface)] border-s border-[var(--border)] elevate-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-extrabold">تعديل عنصر</h4>
              <button className="btn ghost h-9" onClick={() => setEditItem(null)}>إغلاق</button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">الاسم</label>
              <input className="input w-full" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label className="block text-sm">الوصف</label>
              <textarea className="input w-full min-h-20" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">السعر</label>
                  <input className="input w-full" type="number" value={String(editForm.price ?? "")} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm">العملة</label>
                  <input className="input w-full" value={editForm.currency || "JD"} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
                </div>
              </div>
              <label className="block text-sm">الفئة</label>
              <select className="input w-full" value={(editForm.category as Category) || "MEALS"} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}>
                <option value="MEALS">وجبات</option>
                <option value="SNACKS">سناكات</option>
                <option value="DESSERTS">حلويات</option>
                <option value="DRINKS">مشروبات</option>
              </select>
              <label className="block text-sm">رابط الصورة</label>
              <input className="input w-full" value={editForm.imageUrl || ""} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
              <label className="block text-sm">متاح</label>
              <input type="checkbox" className="mx-2" checked={Boolean(editForm.available)} onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })} />
              <div className="flex justify-end">
                <button className="btn h-10" onClick={saveEdit}>حفظ التعديل</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function translateCategory(cat: Category) {
  switch (cat) {
    case "MEALS": return "وجبات";
    case "SNACKS": return "سناكات";
    case "DESSERTS": return "حلويات";
    case "DRINKS": return "مشروبات";
    default: return String(cat);
  }
}
