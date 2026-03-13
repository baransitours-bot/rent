import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ user, property });
}
