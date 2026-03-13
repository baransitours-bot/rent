import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId },
    include: {
      rentals: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
      amenities: {
        include: { amenity: true },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const subscriptionStatus = (session.user as any).subscriptionStatus;
  const { id } = await params;

  if (subscriptionStatus === "paused") {
    return NextResponse.json({ error: "Account is paused. Cannot update properties." }, { status: 403 });
  }

  const existing = await prisma.property.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const body = await request.json();

  // Update amenities if provided
  if (body.amenityIds !== undefined) {
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
    if (body.amenityIds.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: body.amenityIds.map((aid: string) => ({ propertyId: id, amenityId: aid })),
      });
    }
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      address: body.address ?? existing.address,
      city: body.city !== undefined ? body.city : existing.city,
      type: body.type ?? existing.type,
      description: body.description ?? existing.description,
      images: body.images ? JSON.stringify(body.images) : existing.images,
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existing.thumbnail,
      status: body.status ?? existing.status,
      ownershipType: body.ownershipType ?? existing.ownershipType,
      ownerName: body.ownerName !== undefined ? body.ownerName : existing.ownerName,
      ownerPhone: body.ownerPhone !== undefined ? body.ownerPhone : existing.ownerPhone,
      feeType: body.feeType !== undefined ? body.feeType : existing.feeType,
      feeValue: body.feeValue !== undefined ? body.feeValue : existing.feeValue,
    },
  });

  return NextResponse.json(property);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  const existing = await prisma.property.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ message: "Property deleted" });
}
