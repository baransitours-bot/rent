import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, companyName: true, phone: true, locale: true, currency: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const amenityIds = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  const where: any = {
    userId: tenantId,
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
    include: {
      amenities: {
        include: { amenity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ user, properties });
}
