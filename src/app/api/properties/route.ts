import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const properties = await prisma.property.findMany({
    where: { userId },
    include: {
      rentals: {
        where: { status: "active" },
        select: {
          id: true,
          tenantName: true,
          monthlyAmount: true,
          startDate: true,
          endDate: true,
        },
      },
      amenities: {
        include: { amenity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const subscriptionStatus = (session.user as any).subscriptionStatus;

  if (subscriptionStatus === "paused") {
    return NextResponse.json({ error: "Account is paused. Cannot create properties." }, { status: 403 });
  }

  const body = await request.json();
  const { title, address, city, type, description, images, thumbnail, ownershipType, ownerName, ownerPhone, feeType, feeValue, amenityIds } = body;

  if (!title || !address || !type) {
    return NextResponse.json({ error: "Title, address, and type are required" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      userId,
      title,
      address,
      city: city || "",
      type,
      description: description || "",
      images: images ? JSON.stringify(images) : "[]",
      thumbnail: thumbnail ?? 0,
      ownershipType: ownershipType || "owned",
      ownerName: ownerName || null,
      ownerPhone: ownerPhone || null,
      feeType: feeType || null,
      feeValue: feeValue != null ? feeValue : null,
      amenities: amenityIds?.length
        ? { create: amenityIds.map((aid: string) => ({ amenityId: aid })) }
        : undefined,
    },
  });

  return NextResponse.json(property, { status: 201 });
}
