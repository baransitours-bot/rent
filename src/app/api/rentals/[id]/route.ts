import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePayments } from "@/lib/utils";

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

  const rental = await prisma.rental.findFirst({
    where: { id, property: { userId } },
    include: {
      property: true,
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!rental) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  return NextResponse.json(rental);
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
    return NextResponse.json({ error: "Account is paused. Cannot update rentals." }, { status: 403 });
  }

  const existing = await prisma.rental.findFirst({
    where: { id, property: { userId } },
    include: { payments: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  const body = await request.json();

  const rental = await prisma.rental.update({
    where: { id },
    data: {
      tenantName: body.tenantName ?? existing.tenantName,
      tenantPhone: body.tenantPhone ?? existing.tenantPhone,
      monthlyAmount: body.monthlyAmount ?? existing.monthlyAmount,
      startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
      endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
    },
  });

  // Delete unpaid payments and regenerate
  await prisma.payment.deleteMany({
    where: { rentalId: id, status: "unpaid" },
  });

  const newPaymentData = generatePayments(
    rental.startDate,
    rental.endDate,
    rental.monthlyAmount
  );

  // Filter out months that already have paid payments
  const paidMonthLabels = existing.payments
    .filter((p) => p.status === "paid")
    .map((p) => p.monthLabel);

  const paymentsToCreate = newPaymentData.filter(
    (p) => !paidMonthLabels.includes(p.monthLabel)
  );

  if (paymentsToCreate.length > 0) {
    await prisma.payment.createMany({
      data: paymentsToCreate.map((p) => ({
        rentalId: id,
        monthLabel: p.monthLabel,
        dueDate: p.dueDate,
        amount: p.amount,
        status: "unpaid",
      })),
    });
  }

  const updatedRental = await prisma.rental.findUnique({
    where: { id },
    include: { payments: { orderBy: { dueDate: "asc" } } },
  });

  return NextResponse.json(updatedRental);
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

  const existing = await prisma.rental.findFirst({
    where: { id, property: { userId } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  await prisma.rental.delete({ where: { id } });

  await prisma.property.update({
    where: { id: existing.propertyId },
    data: { status: "available" },
  });

  return NextResponse.json({ message: "Rental deleted" });
}
