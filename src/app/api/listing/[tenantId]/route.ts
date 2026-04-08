import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, uniqueSlug } from "@/lib/utils";

const PAGE_SIZE = 12;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  let user = await prisma.user.findFirst({
    where: { slug: tenantId },
    select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true, locale: true, currency: true, logo: true, brandColor: true },
  });
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true, locale: true, currency: true, logo: true, brandColor: true },
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
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "") || PAGE_SIZE, 50);

  const where: any = {
    userId: user.id,
    status: "available",
  };

  if (type) where.type = type;
  if (amenityIds.length > 0) {
    where.amenities = { some: { amenityId: { in: amenityIds } } };
  }

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true, slug: true, title: true, address: true, type: true, description: true,
      images: true, thumbnail: true, status: true,
      amenities: { include: { amenity: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = properties.length > limit;
  const items = hasMore ? properties.slice(0, limit) : properties;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Lazy slug generation for properties
  for (let i = 0; i < items.length; i++) {
    if (!items[i].slug) {
      const baseSlug = generateSlug(items[i].title || items[i].id);
      if (baseSlug) {
        const slug = await uniqueSlug(baseSlug, prisma.property, items[i].id);
        await prisma.property.update({ where: { id: items[i].id }, data: { slug } });
        items[i] = { ...items[i], slug };
      }
    }
  }

  const gaSetting = await prisma.systemSettings.findUnique({ where: { key: "gaTrackingId" } });
  const gaTrackingId = gaSetting?.value || "";

  return NextResponse.json({ user, properties: items, gaTrackingId, nextCursor, hasMore });
}
