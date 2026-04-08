import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSettings.findMany({
    where: { key: { in: ["platformName", "platformNameEn", "platformDescription", "platformDescriptionEn"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const name = map.platformName || "دارك";
  const nameEn = map.platformNameEn || "Darak";
  const desc = map.platformDescription || `اكتشف العقارات المتاحة للإيجار في سوق ${name}. شقق، منازل، محلات تجارية والمزيد.`;
  const descEn = map.platformDescriptionEn || `Browse available rental properties on ${nameEn} marketplace.`;
  const title = `${name} - سوق العقارات | ${nameEn} Property Marketplace`;

  return {
    title,
    description: `${desc} | ${descEn}`,
    openGraph: {
      title,
      description: `${desc} | ${descEn}`,
      type: "website",
      siteName: `${name} | ${nameEn}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
