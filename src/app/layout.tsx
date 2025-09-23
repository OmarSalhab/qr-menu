import type { Metadata } from "next";
import { Tajawal, Noto_Naskh_Arabic } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "@/styles/theme.css";
import { makeBrandVars } from "@/lib/theme-server";
import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

const cairo = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-app-sans",
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const elegant = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-app-elegant",
  weight: ["400", "500", "600", "700"],
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
  const theme = hdrs.get("x-theme");
  const font = hdrs.get("x-font");
  const style = brand ? (makeBrandVars(brand) as unknown as React.CSSProperties) : undefined;

  return (
    <html lang="ar" dir="rtl" data-theme={(theme || "LIGHT").toLowerCase()} data-font={(font || "CLASSIC").toLowerCase()}>
      <body
        className={`${cairo.variable} ${elegant.variable} antialiased`}
        style={{
          fontFamily: "var(--font-app-active, var(--font-app-sans)), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          ...(style || {}),
        }}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
