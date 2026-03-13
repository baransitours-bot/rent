import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; propertyId: string }> }
) {
  const { tenantId, propertyId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, companyName: true, phone: true, whatsapp: true, locale: true, currency: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: tenantId },
    include: {
      amenities: {
        include: { amenity: true },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({ user, property });
}
