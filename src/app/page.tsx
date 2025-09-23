import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import ClientHome from "./ClientHome";
import type { MenuItem as UiMenuItem } from "@/data/menu";
import { defaultWorkingHours, type WorkingHours } from "@/lib/working-hours";

type DbCategory = "MEALS" | "SNACKS" | "DESSERTS" | "DRINKS";
function mapCategoryToArabic(cat: DbCategory) {
  switch (cat) {
    case "MEALS":
      return "الوجبات";
    case "SNACKS":
      return "سناكّي";
    case "DESSERTS":
      return "الحلويات";
    case "DRINKS":
      return "المشروبات";
    default:
      return "الوجبات";
  }
}

export default async function Home() {
  let store = null;
  let items: UiMenuItem[] = [];
  let specials: Array<{ id: string; name: string; description?: string; price: number; prevPrice: number; currency: string; imageUrl: string; category: UiMenuItem["category"]; dateFrom: string; dateTo: string; }> = [];
  try {
    store = await prisma.store.findFirst();
    const dbItems = await prisma.item.findMany({
      where: store ? { storeId: store.id } : undefined,
      orderBy: { createdAt: "desc" },
    });
    type DbItemLite = { id: string; name: string; description: string | null; price: number; currency: string | null; imageUrl: string; available: boolean; category: DbCategory };
    items = (dbItems as DbItemLite[]).map((it) => ({
      id: it.id,
      name: it.name,
      description: it.description ?? undefined,
      price: it.price,
      currency: it.currency ?? "JD",
      imageUrl: it.imageUrl,
      available: it.available,
      category: mapCategoryToArabic(it.category as DbCategory),
    })) as UiMenuItem[];
    const now = new Date();
    const dbSpecials = await prisma.specialItem.findMany({
      where: store ? { storeId: store.id, available: true, dateFrom: { lte: now }, dateTo: { gte: now } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    specials = dbSpecials.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      price: s.price,
      prevPrice: s.prevPrice,
      currency: s.currency ?? "JD",
      imageUrl: s.imageUrl,
      category: mapCategoryToArabic(s.category as DbCategory) as UiMenuItem["category"],
      dateFrom: s.dateFrom.toISOString(),
      dateTo: s.dateTo.toISOString(),
    }));
  } catch {
    // When DATABASE_URL isn't set yet, keep first render clean by showing nothing specific.
    items = [];
  }

  // Access optional fields defensively to avoid type errors on environments where the Prisma client
  // schema hasn't yet included these fields (e.g., migration timing in CI/build).
  const storeAny = store as unknown as { timezone?: string; workingHours?: unknown } | null;
  const timezone = storeAny?.timezone ?? "Asia/Amman";
  const workingHours = (storeAny?.workingHours as WorkingHours | undefined) ?? defaultWorkingHours();
  const storeExtra = store as unknown as {
    googleReviewsUrl?: string | null;
    instagramUrl?: string | null;
    whatsappUrl?: string | null;
    xUrl?: string | null;
    facebookUrl?: string | null;
    googleMapsUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  } | null;

  const storeLite = {
    name: store?.name || "مطعم تجريبي",
    description: store?.description || "طعم لا يعلى عليه",
    bannerUrl: store?.bannerUrl || undefined,
    logoUrl: store?.logoUrl || undefined,
    brandColor: store?.brandColor || undefined,
    timezone,
    workingHours,
    // Optional social/contact fields (may not exist in schema yet). Keep null/undefined to trigger fallbacks client-side.
    googleReviewsUrl: storeExtra?.googleReviewsUrl ?? null,
    instagramUrl: storeExtra?.instagramUrl ?? null,
    whatsappUrl: storeExtra?.whatsappUrl ?? null,
    xUrl: storeExtra?.xUrl ?? null,
    facebookUrl: storeExtra?.facebookUrl ?? null,
    googleMapsUrl: storeExtra?.googleMapsUrl ?? null,
    phone: storeExtra?.phone ?? null,
    email: storeExtra?.email ?? null,
    website: storeExtra?.website ?? null,
  };

  return (
    <div>
      <ClientHome items={items} store={storeLite} specials={specials} />
    </div>
  );
}
