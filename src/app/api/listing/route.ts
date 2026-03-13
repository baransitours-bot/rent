import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public marketplace - only properties from tenants who opted in
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const search = searchParams.get("search");
  const amenityIds = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

  const where: any = {
    status: "available",
    user: {
      subscriptionStatus: { in: ["active", "paused"] },
      listInMarketplace: true,
    },
  };

  if (type) {
    where.type = type;
  }

  if (city) {
    where.city = city;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
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
        select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true },
      },
      amenities: {
        include: { amenity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get distinct cities for filter options
  const cities = await prisma.property.findMany({
    where: {
      status: "available",
      city: { not: "" },
      user: {
        subscriptionStatus: { in: ["active", "paused"] },
        listInMarketplace: true,
      },
    },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });

  return NextResponse.json({
    properties,
    cities: cities.map((c) => c.city),
  });
}
