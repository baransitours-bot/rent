import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const amenities = await prisma.amenity.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(amenities);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { nameAr, nameEn, icon } = body;

  if (!nameAr || !nameEn) {
    return NextResponse.json({ error: "nameAr and nameEn are required" }, { status: 400 });
  }

  const amenity = await prisma.amenity.create({
    data: { nameAr, nameEn, icon: icon || "check" },
  });

  return NextResponse.json(amenity, { status: 201 });
}
