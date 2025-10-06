import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import ClientHome from "./ClientHome";
import { defaultWorkingHours, type WorkingHours } from "@/lib/working-hours";

type MenuItemUi = { id: string; name: string; description?: string; price: number; currency?: string; imageUrl: string; available: boolean; categoryId: string | null };
type SpecialUi = { id: string; name: string; description?: string; price: number; prevPrice: number; currency: string; imageUrl: string; categoryId: string | null; dateFrom: string; dateTo: string };
type CategoryUi = { id: string; display: string };
type StoreLite = {
  name: string; description?: string | null; bannerUrl?: string | null; logoUrl?: string | null; brandColor?: string | null; timezone?: string; workingHours: WorkingHours;
  googleReviewsUrl?: string | null; instagramUrl?: string | null; whatsappUrl?: string | null; xUrl?: string | null; facebookUrl?: string | null; googleMapsUrl?: string | null; phone?: string | null; email?: string | null; website?: string | null;
};

export default async function Home() {
  let store = null;
  // Use optional description/currency for alignment with client component expectations
  let items: MenuItemUi[] = [];
  let specials: SpecialUi[] = [];
  let categories: CategoryUi[] = [];
  try {
    store = await prisma.store.findFirst();
    const dbItems = await prisma.item.findMany({
      where: store ? { storeId: store.id } : undefined,
      orderBy: { createdAt: "desc" },
      include: { categoryRef: true },
    });
    items = dbItems.map(it => ({
      id: it.id,
      name: it.name,
      description: it.description ?? undefined,
      price: it.price,
      currency: it.currency ?? 'JD',
      imageUrl: it.imageUrl,
      available: it.available,
      categoryId: it.categoryId || null,
    }));
    const now = new Date();
    const dbSpecials = await prisma.specialItem.findMany({
      where: store ? { storeId: store.id, available: true, dateFrom: { lte: now }, dateTo: { gte: now } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    specials = dbSpecials.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      price: s.price,
      prevPrice: s.prevPrice,
      currency: s.currency ?? 'JD',
      imageUrl: s.imageUrl,
      categoryId: s.categoryId || null,
      dateFrom: s.dateFrom.toISOString(),
      dateTo: s.dateTo.toISOString(),
    }));
    const dbCategories = await prisma.categoryModel.findMany({
      where: store ? { storeId: store.id } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    categories = dbCategories.map(c => ({ id: c.id, display: c.display }));
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

  const storeLite: StoreLite = {
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
      <ClientHome items={items} store={storeLite} specials={specials} categories={categories} />
    </div>
  );
}
