/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { WorkingHours as WH } from "@/lib/working-hours";
import { useRouter } from "next/navigation";
import type { Category, Item, Store } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

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
        {tab === "offers" && <OffersPanel />}
      </section>
    </main>
  );
}

function ThemePanel() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; brandColor: string; bannerUrl: string; logoUrl: string; timezone: string; workingHours: WH | null; themeMode: "LIGHT" | "DARK"; fontStyle: "CLASSIC" | "ELEGANT"; logoFile?: File | null; bannerFile?: File | null }>({ name: "", description: "", brandColor: "", bannerUrl: "", logoUrl: "", timezone: "Asia/Amman", workingHours: null, themeMode: "LIGHT", fontStyle: "CLASSIC", logoFile: null, bannerFile: null });
  const toast = useToast();

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
        themeMode: (data.store.themeMode as "LIGHT" | "DARK") || "LIGHT",
        fontStyle: (data.store.fontStyle as "CLASSIC" | "ELEGANT") || "CLASSIC",
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function maybeUpload(file: File | null): Promise<string | null> {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("filename", file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) { toast("error", "فشل رفع الصورة"); return null; }
    const data = await res.json();
    return data.url as string;
  }

  // Apply local preview when toggling (without persisting yet)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", form.themeMode.toLowerCase());
      document.documentElement.setAttribute("data-font", form.fontStyle.toLowerCase());
    }
  }, [form.themeMode, form.fontStyle]);

  async function save() {
    setLoading(true);
    // Upload files only when saving
    const logoUrlFinal = (await maybeUpload(form.logoFile || null)) || form.logoUrl;
    const bannerUrlFinal = (await maybeUpload(form.bannerFile || null)) || form.bannerUrl;
    const payload: { name: string; description: string; brandColor: string; bannerUrl: string; logoUrl: string; timezone: string; workingHours: WH | null; themeMode: "LIGHT" | "DARK"; fontStyle: "CLASSIC" | "ELEGANT" } = {
      name: form.name,
      description: form.description,
      brandColor: form.brandColor,
      bannerUrl: bannerUrlFinal,
      logoUrl: logoUrlFinal,
      timezone: form.timezone,
      workingHours: form.workingHours,
      themeMode: form.themeMode,
      fontStyle: form.fontStyle,
    };
  const res = await fetch("/api/admin/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setStore(data.store);
      // Ensure immediate reflection across current page as well
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", form.themeMode.toLowerCase());
        document.documentElement.setAttribute("data-font", form.fontStyle.toLowerCase());
      }
      toast("success", "تم حفظ التعديلات");
    } else {
      const data = await res.json().catch(() => ({}));
      toast("error", data.error || "فشل حفظ التعديلات");
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
              <label className="block text-sm mb-1">وضع الواجهة</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="themeMode" checked={form.themeMode === "LIGHT"} onChange={() => setForm({ ...form, themeMode: "LIGHT" })} />
                  نهاري (فاتح)
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="themeMode" checked={form.themeMode === "DARK"} onChange={() => setForm({ ...form, themeMode: "DARK" })} />
                  ليلي (داكن)
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">الخط</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="fontStyle" checked={form.fontStyle === "CLASSIC"} onChange={() => setForm({ ...form, fontStyle: "CLASSIC" })} />
                  كلاسيكي
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="fontStyle" checked={form.fontStyle === "ELEGANT"} onChange={() => setForm({ ...form, fontStyle: "ELEGANT" })} />
                  أنيق (مناسب للمقاهي)
                </label>
              </div>
            </div>
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
            <label className="block text-sm mb-1">شعار المتجر</label>
            <div className="flex items-center gap-3">
              <input className="input w-full" placeholder="أدخل رابط مباشر للصورة" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, logoFile: e.target.files?.[0] || null })} />
            </div>
            {(form.logoFile || form.logoUrl) && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.logoFile ? URL.createObjectURL(form.logoFile) : form.logoUrl} alt="logo preview" className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">صورة البانر</label>
            <div className="flex items-center gap-3">
              <input className="input w-full" placeholder="أدخل رابط مباشر للصورة" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} />
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, bannerFile: e.target.files?.[0] || null })} />
            </div>
            {(form.bannerFile || form.bannerUrl) && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.bannerFile ? URL.createObjectURL(form.bannerFile) : form.bannerUrl} alt="banner preview" className="w-40 h-20 object-cover rounded-lg border border-[var(--border)]" />
              </div>
            )}
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
  const [createForm, setCreateForm] = useState({ name: "", price: "", currency: "JD", imageUrl: "", file: null as File | null, available: true, category: "MEALS" as Category, description: "" });
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editForm, setEditForm] = useState<(Partial<Item> & { file?: File })>({});
  const toast = useToast();

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
    } else {
      toast("error", "فشل تحميل العناصر");
    }
  }, [page, perPage, filters, toast]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => { load(); }, [load, filterKey]);

  async function maybeUpload(file: File | null): Promise<string | null> {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("filename", file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) { toast("error", "فشل رفع الصورة"); return null; }
    const data = await res.json();
    return data.url as string;
  }

  async function createItem() {
    const imageUrl = (await maybeUpload(createForm.file)) || createForm.imageUrl;
    const payload = {
      name: createForm.name,
      description: createForm.description,
      price: parseFloat(String(createForm.price || 0)),
      currency: createForm.currency,
      imageUrl,
      available: createForm.available,
      category: createForm.category,
    };
    const res = await fetch("/api/admin/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
  setCreateForm({ name: "", price: "", currency: "JD", imageUrl: "", file: null, available: true, category: "MEALS" as Category, description: "" });
      load();
      toast("success", "تم إنشاء العنصر");
    } else {
      const data = await res.json().catch(() => ({}));
      toast("error", data.error || "فشل إنشاء العنصر");
    }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    if (res.ok) { load(); toast("success", "تم حذف العنصر"); }
    else { const data = await res.json().catch(() => ({})); toast("error", data.error || "فشل حذف العنصر"); }
  }

  async function saveEdit() {
    if (!editItem) return;
    let imageUrl = editForm.imageUrl || editItem.imageUrl;
    if (editForm.file && editForm.file instanceof File) {
      const fd = new FormData();
      fd.append("file", editForm.file);
      fd.append("filename", editForm.file.name);
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (up.ok) { const data = await up.json(); imageUrl = data.url; }
      else { toast("error", "فشل رفع الصورة"); return; }
    }
    const res = await fetch(`/api/admin/items/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, imageUrl }) });
    if (res.ok) { setEditItem(null); setEditForm({}); load(); toast("success", "تم حفظ التعديل"); }
    else { const data = await res.json().catch(() => ({})); toast("error", data.error || "فشل حفظ التعديل"); }
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
              <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} />
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
              <label className="block text-sm mb-1">الصورة</label>
              <div className="flex items-center gap-3">
                <input className="input w-full" placeholder="أدخل رابط مباشر للصورة" value={createForm.imageUrl} onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setCreateForm({ ...createForm, file: e.target.files?.[0] || null })} />
              </div>
              {(createForm.file || createForm.imageUrl) && (
                <div className="mt-2">
                  <img src={createForm.file ? URL.createObjectURL(createForm.file) : createForm.imageUrl} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]" />
                </div>
              )}
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
          <input className="input w-full" type="number" step="0.01" inputMode="decimal" placeholder="أدنى سعر" value={filters.minPrice || ""} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value || undefined })} />
          <input className="input w-full" type="number" step="0.01" inputMode="decimal" placeholder="أعلى سعر" value={filters.maxPrice || ""} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value || undefined })} />
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
          <div className="absolute top-0 bottom-0 right-0 w-[88vw] max-w-[520px] bg-[var(--surface)] border-s border-[var(--border)] elevate-md flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)] z-10">
              <h4 className="text-lg font-extrabold">تعديل عنصر</h4>
              <button className="btn ghost h-9" onClick={() => setEditItem(null)}>إغلاق</button>
            </div>
            <div className="space-y-3 p-5 overflow-y-auto">
              <label className="block text-sm">الاسم</label>
              <input className="input w-full" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label className="block text-sm">الوصف</label>
              <textarea className="input w-full min-h-20" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">السعر</label>
                  <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={String(editForm.price ?? "")} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} />
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
              <label className="block text-sm">الصورة</label>
              <div className="flex items-center gap-3">
                <input className="input w-full" value={editForm.imageUrl || ""} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, file: e.target.files?.[0] })} />
              </div>
              {(editForm?.file || editForm?.imageUrl) && (
                <div className="mt-2">
                  <img src={editForm.file ? URL.createObjectURL(editForm.file) : (editForm.imageUrl as string)} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]" />
                </div>
              )}
              <label className="block text-sm">متاح</label>
              <input type="checkbox" className="mx-2" checked={Boolean(editForm.available)} onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })} />
              <div className="flex justify-end sticky bottom-0 bg-[var(--surface)] pt-3">
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

type SpecialItem = import("@prisma/client").SpecialItem;
type SpecialsResponse = { items: SpecialItem[]; total: number; page: number; perPage: number };

function OffersPanel() {
  const [items, setItems] = useState<SpecialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ category?: Category; activeOnly?: boolean; search?: string }>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", price: "", prevPrice: "", currency: "JD", imageUrl: "", file: null as File | null, available: true, category: "MEALS" as Category, dateFrom: "", dateTo: "" });
  const [editItem, setEditItem] = useState<SpecialItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<SpecialItem> & { file?: File } >({});
  const toast = useToast();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (filters.category) qs.set("category", filters.category);
    if (filters.activeOnly) qs.set("activeOnly", "true");
    if (filters.search) qs.set("search", filters.search);
    const res = await fetch(`/api/admin/special-items?${qs.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (res.ok) {
      const data: SpecialsResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPerPage(data.perPage);
    } else {
      toast("error", "فشل تحميل العروض");
    }
  }, [page, perPage, filters, toast]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => { load(); }, [load, filterKey]);

  async function maybeUpload(file: File | null): Promise<string | null> {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    form.append("filename", file.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) { toast("error", "فشل رفع الصورة"); return null; }
    const data = await res.json();
    return data.url as string;
  }

  async function createItem() {
    const imageUrl = (await maybeUpload(createForm.file)) || createForm.imageUrl;
    const payload = {
      name: createForm.name,
      description: createForm.description,
      price: parseFloat(String(createForm.price || 0)),
      prevPrice: parseFloat(String(createForm.prevPrice || 0)),
      currency: createForm.currency,
      imageUrl,
      available: createForm.available,
      category: createForm.category,
      dateFrom: createForm.dateFrom,
      dateTo: createForm.dateTo,
    };
    const res = await fetch("/api/admin/special-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setCreateForm({ name: "", description: "", price: "", prevPrice: "", currency: "JD", imageUrl: "", file: null, available: true, category: "MEALS", dateFrom: "", dateTo: "" });
      setCreateOpen(false);
      load();
      toast("success", "تم إنشاء العرض الخاص");
    } else {
      const data = await res.json().catch(() => ({}));
      toast("error", data.error || "فشل إنشاء العرض");
    }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/admin/special-items/${id}`, { method: "DELETE" });
    if (res.ok) { load(); toast("success", "تم حذف العرض"); }
    else { const data = await res.json().catch(() => ({})); toast("error", data.error || "فشل حذف العرض"); }
  }

  async function saveEdit() {
    if (!editItem) return;
    let imageUrl = editForm.imageUrl || editItem.imageUrl;
    if (editForm.file && editForm.file instanceof File) {
      const uploaded = await maybeUpload(editForm.file);
      if (uploaded) imageUrl = uploaded;
    }
    const body: Partial<SpecialItem> & { imageUrl: string } = {
      imageUrl,
      name: editForm.name,
      description: editForm.description,
      price: typeof editForm.price === "number" ? editForm.price : undefined,
      prevPrice: typeof editForm.prevPrice === "number" ? editForm.prevPrice : undefined,
      currency: editForm.currency,
      category: editForm.category,
      available: editForm.available,
      dateFrom: editForm.dateFrom,
      dateTo: editForm.dateTo,
    };
    const res = await fetch(`/api/admin/special-items/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditItem(null); setEditForm({}); load(); toast("success", "تم حفظ التعديل"); }
    else { const data = await res.json().catch(() => ({})); toast("error", data.error || "فشل حفظ التعديل"); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold">العروض الخاصة</h3>
          <p className="text-[var(--muted)]">إنشاء وإدارة العروض الخاصة مع تواريخ البدء والانتهاء.</p>
        </div>
        <button className="btn h-10" onClick={() => setCreateOpen(v => !v)}>{createOpen ? "إخفاء إنشاء عرض" : "إنشاء عرض"}</button>
      </header>

      {createOpen && (
        <div className="card p-5 rounded-[16px] elevate-md space-y-4">
          <h4 className="text-lg font-extrabold">عرض جديد</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">العنوان</label>
              <input className="input w-full" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">الوصف</label>
              <textarea className="input w-full min-h-20" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">السعر بعد الخصم</label>
              <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">السعر الأصلي</label>
              <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={createForm.prevPrice} onChange={(e) => setCreateForm({ ...createForm, prevPrice: e.target.value })} />
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
              <label className="block text-sm mb-1">ساري من</label>
              <input className="input w-full" type="datetime-local" value={createForm.dateFrom} onChange={(e) => setCreateForm({ ...createForm, dateFrom: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1">ساري حتى</label>
              <input className="input w-full" type="datetime-local" value={createForm.dateTo} onChange={(e) => setCreateForm({ ...createForm, dateTo: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">صورة العرض</label>
              <div className="flex items-center gap-3">
                <input className="input w-full" placeholder="أو أدخل رابط مباشر للصورة" value={createForm.imageUrl} onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setCreateForm({ ...createForm, file: e.target.files?.[0] || null })} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">متاح</label>
              <input type="checkbox" className="mx-2" checked={createForm.available} onChange={(e) => setCreateForm({ ...createForm, available: e.target.checked })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn h-10" onClick={createItem}>حفظ العرض</button>
          </div>
        </div>
      )}

      <div className="card p-5 rounded-[16px] elevate-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input className="input w-full" placeholder="بحث بالعنوان" value={filters.search || ""} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
          <select className="input w-full" value={filters.category || ""} onChange={(e) => setFilters({ ...filters, category: (e.target.value || undefined) as Category | undefined })}>
            <option value="">كل الفئات</option>
            <option value="MEALS">وجبات</option>
            <option value="SNACKS">سناكات</option>
            <option value="DESSERTS">حلويات</option>
            <option value="DRINKS">مشروبات</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.activeOnly || false} onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked || undefined })} />فعال فقط</label>
          <select className="input w-full" value={String(perPage)} onChange={(e) => setPerPage(Number(e.target.value))}>
            <option value="10">10 / صفحة</option>
            <option value="20">20 / صفحة</option>
            <option value="50">50 / صفحة</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--muted)] text-xs">
                <th className="text-start p-2">العنوان</th>
                <th className="text-start p-2">الفئة</th>
                <th className="text-start p-2">السعر</th>
                <th className="text-start p-2">الفترة</th>
                <th className="text-start p-2">الحالة</th>
                <th className="text-start p-2">عمليات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const active = it.available && new Date(it.dateFrom) <= new Date() && new Date(it.dateTo) >= new Date();
                return (
                  <tr key={it.id} className="border-t border-[var(--border)]">
                    <td className="p-2 font-medium">{it.name}</td>
                    <td className="p-2">{translateCategory(it.category)}</td>
                    <td className="p-2"><span className="line-through text-[var(--muted)] mr-2">{it.prevPrice.toFixed(2)}</span> {it.price.toFixed(2)} {it.currency}</td>
                    <td className="p-2">{new Date(it.dateFrom).toLocaleDateString("ar-JO")} - {new Date(it.dateTo).toLocaleDateString("ar-JO")}</td>
                    <td className="p-2">{active ? "فعال" : "غير فعال"}</td>
                    <td className="p-2 space-x-2 space-x-reverse">
                      <button className="btn ghost h-8" onClick={() => { setEditItem(it); setEditForm(it); }}>تعديل</button>
                      <button className="btn ghost h-8" onClick={() => deleteItem(it.id)}>حذف</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-[var(--muted)]" colSpan={6}>{loading ? "جار التحميل..." : "لا توجد عروض"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[var(--muted)]">الصفحة {page} من {totalPages}</div>
          <div className="space-x-2 space-x-reverse">
            <button className="btn h-9" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>السابق</button>
            <button className="btn h-9" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>التالي</button>
          </div>
        </div>
      </div>

      {editItem && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditItem(null)} />
          <div className="absolute top-0 bottom-0 right-0 w-[88vw] max-w-[520px] bg-[var(--surface)] border-s border-[var(--border)] elevate-md flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)] z-10">
              <h4 className="text-lg font-extrabold">تعديل عرض</h4>
              <button className="btn ghost h-9" onClick={() => setEditItem(null)}>إغلاق</button>
            </div>
            <div className="space-y-3 p-5 overflow-y-auto">
              <label className="block text-sm">العنوان</label>
              <input className="input w-full" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label className="block text-sm">الوصف</label>
              <textarea className="input w-full min-h-20" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">السعر بعد الخصم</label>
                  <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={String(editForm.price ?? "")} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm">السعر الأصلي</label>
                  <input className="input w-full" type="number" step="0.01" inputMode="decimal" value={String(editForm.prevPrice ?? "")} onChange={(e) => setEditForm({ ...editForm, prevPrice: parseFloat(e.target.value) })} />
                </div>
              </div>
              <label className="block text-sm">العملة</label>
              <input className="input w-full" value={editForm.currency || "JD"} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
              <label className="block text-sm">الفئة</label>
              <select className="input w-full" value={(editForm.category as Category) || "MEALS"} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}>
                <option value="MEALS">وجبات</option>
                <option value="SNACKS">سناكات</option>
                <option value="DESSERTS">حلويات</option>
                <option value="DRINKS">مشروبات</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">ساري من</label>
                  <input className="input w-full" type="datetime-local" value={(editForm.dateFrom ? new Date(editForm.dateFrom as unknown as string).toISOString().slice(0,16) : "")} onChange={(e) => setEditForm({ ...editForm, dateFrom: new Date(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm">ساري حتى</label>
                  <input className="input w-full" type="datetime-local" value={(editForm.dateTo ? new Date(editForm.dateTo as unknown as string).toISOString().slice(0,16) : "")} onChange={(e) => setEditForm({ ...editForm, dateTo: new Date(e.target.value) })} />
                </div>
              </div>
              <label className="block text-sm">الصورة</label>
              <div className="flex items-center gap-3">
                <input className="input w-full" value={editForm.imageUrl || ""} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, file: e.target.files?.[0] })} />
              </div>
              <label className="block text-sm">متاح</label>
              <input type="checkbox" className="mx-2" checked={Boolean(editForm.available)} onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })} />
              <div className="flex justify-end sticky bottom-0 bg-[var(--surface)] pt-3">
                <button className="btn h-10" onClick={saveEdit}>حفظ التعديل</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
