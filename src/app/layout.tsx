import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased`} style={{fontFamily: "var(--font-app-sans), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"}}>
        {children}
      </body>
    </html>
  );
}
