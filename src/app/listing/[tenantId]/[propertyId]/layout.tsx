import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantId: string; propertyId: string }>;
}): Promise<Metadata> {
  const { tenantId, propertyId } = await params;

  // Resolve tenant
  let user = await prisma.user.findFirst({
    where: { slug: tenantId },
    select: { id: true, name: true, companyName: true },
  });
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, companyName: true },
    });
  }

  if (!user) {
    return { title: "Property Not Found" };
  }

  // Resolve property
  let property = await prisma.property.findFirst({
    where: { slug: propertyId, userId: user.id },
    select: { title: true, address: true, description: true, images: true, type: true, thumbnail: true },
  });
  if (!property) {
    property = await prisma.property.findFirst({
      where: { id: propertyId, userId: user.id },
      select: { title: true, address: true, description: true, images: true, type: true, thumbnail: true },
    });
  }

  if (!property) {
    return { title: "Property Not Found" };
  }

  const agentName = user.companyName || user.name;
  const title = `${property.title} - ${agentName}`;
  const description = property.description
    ? `${property.description.slice(0, 155)}...`
    : `${property.title} - ${property.address}. عقار للإيجار من ${agentName}`;

  const images: string[] = JSON.parse(property.images || "[]");
  const ogImage = images[property.thumbnail || 0] || images[0];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || property.title,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
    },
    ...(ogImage && !ogImage.startsWith("data:") ? { image: ogImage } : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Darak",
      ...(ogImage && !ogImage.startsWith("data:") ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "script:ld+json": JSON.stringify(jsonLd),
    },
  };
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
