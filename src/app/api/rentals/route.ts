import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePayments } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const rentals = await prisma.rental.findMany({
    where: {
      status: "active",
      property: { userId },
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          ownershipType: true,
          feeType: true,
          feeValue: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rentals);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const subscriptionStatus = (session.user as any).subscriptionStatus;

  if (subscriptionStatus === "paused") {
    return NextResponse.json({ error: "Account is paused. Cannot create rentals." }, { status: 403 });
  }

  const body = await request.json();
  const { propertyId, tenantName, tenantPhone, monthlyAmount, startDate, endDate } = body;

  if (!propertyId || !tenantName || !monthlyAmount || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const rental = await prisma.rental.create({
    data: {
      propertyId,
      tenantName,
      tenantPhone: tenantPhone || "",
      monthlyAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "active",
    },
  });

  const paymentData = generatePayments(new Date(startDate), new Date(endDate), monthlyAmount);

  await prisma.payment.createMany({
    data: paymentData.map((p) => ({
      rentalId: rental.id,
      monthLabel: p.monthLabel,
      dueDate: p.dueDate,
      amount: p.amount,
      status: "unpaid",
    })),
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "rented" },
  });

  const createdRental = await prisma.rental.findUnique({
    where: { id: rental.id },
    include: { payments: true },
  });

  return NextResponse.json(createdRental, { status: 201 });
}
