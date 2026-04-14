import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  let name = "دارك";
  let nameEn = "Darak";
  let desc = "";
  let descEn = "";

  try {
    const settings = await prisma.systemSettings.findMany({
      where: { key: { in: ["platformName", "platformNameEn", "platformDescription", "platformDescriptionEn"] } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    name = map.platformName || name;
    nameEn = map.platformNameEn || nameEn;
    desc = map.platformDescription || "";
    descEn = map.platformDescriptionEn || "";
  } catch {
    // DB not ready yet, use defaults
  }

  const fullDesc = desc || `منصة ${name} لإدارة العقارات والإيجارات. أدر عقاراتك بسهولة واعرضها في السوق العام.`;
  const fullDescEn = descEn || `${nameEn} - Multi-tenant rental property management platform.`;

  return {
    title: {
      default: `${name} - إدارة العقارات | ${nameEn} Property Management`,
      template: `%s | ${name}`,
    },
    description: `${fullDesc} | ${fullDescEn}`,
    keywords: ["property management", "rental", "real estate", "إدارة عقارات", "إيجار", "عقارات", name, nameEn],
    authors: [{ name: nameEn }],
    openGraph: {
      type: "website",
      locale: "ar_SA",
      alternateLocale: "en_US",
      siteName: `${name} | ${nameEn}`,
      title: `${name} - إدارة العقارات | ${nameEn} Property Management`,
      description: `${fullDesc} | ${fullDescEn}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | ${nameEn}`,
      description: fullDesc,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="light" style={{ colorScheme: "light" }}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KP6MFF24');`}</Script>
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KP6MFF24" height="0" width="0" style={{display:"none",visibility:"hidden"}} /></noscript>
        {children}
      </body>
    </html>
  );
}
