import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tenant = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyName: true,
      currency: true,
      locale: true,
      subscriptionStatus: true,
      subscriptionStartDate: true,
      subscriptionExpiryDate: true,
      defaultFeeType: true,
      defaultFeeValue: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      maxImages: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const propertyCount = await prisma.property.count({ where: { userId: id } });
  const rentalCount = await prisma.rental.count({
    where: { property: { userId: id } },
  });

  return NextResponse.json({ ...tenant, propertyCount, rentalCount });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  if (body.email && body.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: body.email } });
    if (emailTaken) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
  }

  const tenant = await prisma.user.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phone,
      companyName: body.companyName ?? existing.companyName,
      subscriptionStatus: body.subscriptionStatus ?? existing.subscriptionStatus,
      subscriptionStartDate: body.subscriptionStartDate ? new Date(body.subscriptionStartDate) : existing.subscriptionStartDate,
      subscriptionExpiryDate: body.subscriptionExpiryDate ? new Date(body.subscriptionExpiryDate) : existing.subscriptionExpiryDate,
      maxImages: body.maxImages !== undefined ? body.maxImages : existing.maxImages,
    },
  });

  return NextResponse.json(tenant);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "Tenant deleted" });
}
