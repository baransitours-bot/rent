import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);

  const propertyId = searchParams.get("propertyId");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = {
    rental: {
      property: { userId },
    },
  };

  if (propertyId) {
    where.rental.propertyId = propertyId;
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.dueDate = {};
    if (dateFrom) {
      where.dueDate.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.dueDate.lte = new Date(dateTo);
    }
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      rental: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              ownershipType: true,
              feeType: true,
              feeValue: true,
            },
          },
        },
      },
    },
    orderBy: { dueDate: "desc" },
  });

  return NextResponse.json(payments);
}
