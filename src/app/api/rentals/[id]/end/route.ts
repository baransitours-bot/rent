import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  const existing = await prisma.rental.findFirst({
    where: { id, property: { userId } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  const rental = await prisma.rental.update({
    where: { id },
    data: { status: "ended" },
  });

  await prisma.property.update({
    where: { id: existing.propertyId },
    data: { status: "available" },
  });

  return NextResponse.json(rental);
}
