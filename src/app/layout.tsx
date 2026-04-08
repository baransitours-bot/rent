import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "دارك - إدارة العقارات | Darak Property Management",
    template: "%s | دارك",
  },
  description: "منصة دارك لإدارة العقارات والإيجارات. أدر عقاراتك بسهولة واعرضها في السوق العام. | Darak - Multi-tenant rental property management platform.",
  keywords: ["property management", "rental", "real estate", "إدارة عقارات", "إيجار", "عقارات", "دارك", "Darak"],
  authors: [{ name: "Darak" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    siteName: "دارك | Darak",
    title: "دارك - إدارة العقارات | Darak Property Management",
    description: "منصة دارك لإدارة العقارات والإيجارات. | Darak property management platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "دارك | Darak",
    description: "منصة دارك لإدارة العقارات والإيجارات.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="light" style={{ colorScheme: "light" }}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
