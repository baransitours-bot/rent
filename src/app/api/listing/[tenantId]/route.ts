import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, uniqueSlug } from "@/lib/utils";

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  // Try to find by slug first, then by ID
  let user = await prisma.user.findFirst({
    where: { slug: tenantId },
    select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true, locale: true, currency: true },
  });
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true, locale: true, currency: true },
    });
  }

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Lazy slug generation for user
  if (!user.slug) {
    const baseName = user.companyName || user.name || user.id;
    const baseSlug = generateSlug(baseName);
    if (baseSlug) {
      const slug = await uniqueSlug(baseSlug, prisma.user, user.id);
      await prisma.user.update({ where: { id: user.id }, data: { slug } });
      user = { ...user, slug };
    }
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const amenityIds = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  const where: any = {
    userId: user.id,
    status: "available",
  };

  if (type) {
    where.type = type;
  }

  if (amenityIds.length > 0) {
    where.amenities = {
      some: {
        amenityId: { in: amenityIds },
      },
    };
  }

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      address: true,
      type: true,
      description: true,
      images: true,
      thumbnail: true,
      status: true,
      amenities: {
        include: { amenity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Lazy slug generation for properties
  for (let i = 0; i < properties.length; i++) {
    if (!properties[i].slug) {
      const baseSlug = generateSlug(properties[i].title || properties[i].id);
      if (baseSlug) {
        const slug = await uniqueSlug(baseSlug, prisma.property, properties[i].id);
        await prisma.property.update({ where: { id: properties[i].id }, data: { slug } });
        properties[i] = { ...properties[i], slug };
      }
    }
  }

  return NextResponse.json({ user, properties });
}
