import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "@/styles/theme.css";
import { makeBrandVars } from "@/lib/theme-server";
import Sidebar from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-app-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "قائمة المطعم - QR Menu",
  description: "قائمة تفاعلية مع تخطيط عربي أنيق",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read brand from middleware-injected header (hybrid approach)
  const hdrs = await headers();
  const brand = hdrs.get("x-brand");
  const style = brand ? (makeBrandVars(brand) as unknown as React.CSSProperties) : undefined;

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} antialiased`}
        style={{
          fontFamily: "var(--font-app-sans), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          ...(style || {}),
        }}
      >
        {children}
      </body>
    </html>
  );
}
