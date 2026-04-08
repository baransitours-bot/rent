import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const city = searchParams.get("city");
  const search = searchParams.get("search");
  const amenityIds = searchParams.get("amenities")?.split(",").filter(Boolean) || [];
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "") || PAGE_SIZE, 50);

  const where: any = {
    status: "available",
    user: {
      subscriptionStatus: { in: ["active", "paused"] },
      listInMarketplace: true,
    },
  };

  if (type) where.type = type;
  if (city) where.city = city;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (amenityIds.length > 0) {
    where.amenities = { some: { amenityId: { in: amenityIds } } };
  }

  const properties = await prisma.property.findMany({
    where,
    include: {
      user: {
        select: { id: true, slug: true, name: true, companyName: true, phone: true, whatsapp: true },
      },
      amenities: { include: { amenity: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = properties.length > limit;
  const items = hasMore ? properties.slice(0, limit) : properties;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

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

  // Get system GA tracking ID
  const gaSetting = await prisma.systemSettings.findUnique({ where: { key: "gaTrackingId" } });
  const gaTrackingId = gaSetting?.value || "";

  return NextResponse.json({
    properties: items,
    cities: cities.map((c) => c.city),
    gaTrackingId,
    nextCursor,
    hasMore,
  });
}
