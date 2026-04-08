import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ tenantId: string }> }): Promise<Metadata> {
  const { tenantId } = await params;

  let user = await prisma.user.findFirst({
    where: { slug: tenantId },
    select: { name: true, companyName: true, logo: true },
  });
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { name: true, companyName: true, logo: true },
    });
  }

  const name = user?.companyName || user?.name || "Agent";
  const title = `${name} - عقارات للإيجار | Properties for Rent`;
  const description = `تصفح العقارات المتاحة للإيجار من ${name}. شقق، منازل، محلات والمزيد. | Browse properties for rent from ${name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "دارك | Darak",
      ...(user?.logo ? { images: [{ url: user.logo }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
