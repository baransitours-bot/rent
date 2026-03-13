import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "إدارة العقارات - Property Management",
  description: "Multi-tenant rental property management SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="light" style={{ colorScheme: "light" }}>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
