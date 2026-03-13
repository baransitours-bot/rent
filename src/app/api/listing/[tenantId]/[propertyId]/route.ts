import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, uniqueSlug } from "@/lib/utils";

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; propertyId: string }> }
) {
  const { tenantId, propertyId } = await params;

  // Resolve tenant by slug first, then by ID
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

  // Resolve property by slug first, then by ID
  let property = await prisma.property.findFirst({
    where: { slug: propertyId, userId: user.id },
    include: {
      amenities: {
        include: { amenity: true },
      },
    },
  });
  if (!property) {
    property = await prisma.property.findFirst({
      where: { id: propertyId, userId: user.id },
      include: {
        amenities: {
          include: { amenity: true },
        },
      },
    });
  }

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Lazy slug generation for property
  if (!property.slug) {
    const baseSlug = generateSlug(property.title || property.id);
    if (baseSlug) {
      const slug = await uniqueSlug(baseSlug, prisma.property, property.id);
      await prisma.property.update({ where: { id: property.id }, data: { slug } });
      property = { ...property, slug };
    }
  }

  return NextResponse.json({ user, property });
}
