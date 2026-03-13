import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - any authenticated tenant can fetch amenities list
export async function GET() {
  const amenities = await prisma.amenity.findMany({
    orderBy: { nameEn: "asc" },
  });
  return NextResponse.json(amenities);
}
