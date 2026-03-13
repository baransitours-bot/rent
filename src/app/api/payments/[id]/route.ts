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

  const existing = await prisma.payment.findFirst({
    where: { id, rental: { property: { userId } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const body = await request.json();

  const newStatus = existing.status === "paid" ? "unpaid" : "paid";

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: body.status !== undefined ? body.status : newStatus,
      paidAt: (body.status !== undefined ? body.status : newStatus) === "paid" ? new Date() : null,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    },
  });

  return NextResponse.json(payment);
}
