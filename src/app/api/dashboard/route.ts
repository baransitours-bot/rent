import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get all payments for user's properties this month
  const thisMonthPayments = await prisma.payment.findMany({
    where: {
      rental: {
        property: { userId },
      },
      dueDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
  });

  const totalRentThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const collectedThisMonth = thisMonthPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const remainingThisMonth = totalRentThisMonth - collectedThisMonth;

  // All-time collected
  const allPaidPayments = await prisma.payment.aggregate({
    where: {
      rental: {
        property: { userId },
      },
      status: "paid",
    },
    _sum: { amount: true },
  });
  const allTimeCollected = allPaidPayments._sum.amount || 0;

  // Calculate total fees this month for managed properties with active rentals
  const managedProperties = await prisma.property.findMany({
    where: {
      userId,
      ownershipType: "managed",
      rentals: {
        some: { status: "active" },
      },
    },
    include: {
      rentals: {
        where: { status: "active" },
        select: { monthlyAmount: true },
      },
    },
  });

  let totalFeesThisMonth = 0;
  for (const property of managedProperties) {
    for (const rental of property.rentals) {
      if (property.feeType === "percentage" && property.feeValue != null) {
        totalFeesThisMonth += (property.feeValue / 100) * rental.monthlyAmount;
      } else if (property.feeType === "fixed" && property.feeValue != null) {
        totalFeesThisMonth += property.feeValue;
      }
    }
  }

  return NextResponse.json({
    totalRentThisMonth,
    collectedThisMonth,
    remainingThisMonth,
    allTimeCollected,
    totalFeesThisMonth,
  });
}
