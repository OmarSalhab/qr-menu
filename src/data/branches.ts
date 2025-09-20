export type Branch = {
  id: string;
  name: string; // e.g., "طبر بور | الفرع الرئيسي"
  phone: string;
  gmapsUrl?: string;
  coords?: [number, number];
};

export const branches: Branch[] = [
  {
    id: "main",
    name: "طبر بور | الفرع الرئيسي",
    phone: "+962 797756939",
    gmapsUrl: "https://maps.google.com",
    coords: [31.95, 35.93],
  },
  {
    id: "west",
    name: "دوار الغربية | فرع المدينة",
    phone: "+962 777000111",
    gmapsUrl: "https://maps.google.com",
    coords: [31.99, 35.90],
  },
];
