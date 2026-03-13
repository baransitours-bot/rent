import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public general listing - all available properties from all tenants
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const amenityIds = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  const where: any = {
    status: "available",
    user: { subscriptionStatus: { in: ["active", "paused"] } },
  };

  if (type) {
    where.type = type;
  }

  if (amenityIds.length > 0) {
    where.amenities = {
      some: { amenityId: { in: amenityIds } },
    };
  }

  const properties = await prisma.property.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, companyName: true, phone: true, whatsapp: true },
      },
      amenities: {
        include: { amenity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}
