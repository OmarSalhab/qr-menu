export type MenuCategory = "الوجبات" | "سناكّي" | "الحلويات" | "المشروبات";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string; // e.g., JD
  imageUrl: string;
  category: MenuCategory;
  available?: boolean;
};

export const categories: MenuCategory[] = [
  "الوجبات",
  "سناكّي",
  "الحلويات",
  "المشروبات",
];

export const menuItems: MenuItem[] = [
  {
    id: "shawarma_double",
    name: "وجبة شاورما دبل",
    description: "وجبة مع بطاطا ومايتريكس",
    price: 3.0,
    currency: "JD",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-4316520300d6?q=80&w=800&auto=format&fit=crop",
    category: "الوجبات",
    available: true,
  },
  {
    id: "broast_4",
    name: "وجبة بروستد 4 قطع",
    description: "وجبة بروستد 4 قطع لشخص واحد",
    price: 2.5,
    currency: "JD",
    imageUrl:
      "https://whatsbeefjo.com/cdn/shop/products/IMG_0019_1.jpg?v=1674048959",
    category: "الوجبات",
    available: true,
  },
  {
    id: "sandwich_falafel",
    name: "ساندويتش",
    description: "فلافل طازج مع صوص",
    price: 1.5,
    currency: "JD",
    imageUrl:
      "https://images.unsplash.com/photo-1606756790138-261d1b9f58f1?q=80&w=800&auto=format&fit=crop",
    category: "سناكّي",
    available: true,
  },
  {
    id: "spaghetti_bolognese",
    name: "سباغيتي بولونيز",
    description: "سباغيتي محضرة مع كرات اللحم المفروم",
    price: 4.0,
    currency: "JD",
    imageUrl:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop",
    category: "سناكّي",
    available: false,
  },
  {
    id: "kunafeh",
    name: "كنافة",
    description: "كنافة عربية طازجة",
    price: 2.0,
    currency: "JD",
    imageUrl:
      "https://images.unsplash.com/photo-1625944521666-3c2635ee11ad?q=80&w=800&auto=format&fit=crop",
    category: "الحلويات",
    available: true,
  },
  {
    id: "iced_coffee",
    name: "آيس كوفي",
    description: "قهوة باردة منعشة",
    price: 1.25,
    currency: "JD",
    imageUrl:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
    category: "المشروبات",
    available: true,
  },
];
