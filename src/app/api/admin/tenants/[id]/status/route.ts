import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const { subscriptionStatus } = body;

  const validStatuses = ["active", "paused", "suspended", "expired"];
  if (!subscriptionStatus || !validStatuses.includes(subscriptionStatus)) {
    return NextResponse.json({ error: "Invalid subscription status" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const tenant = await prisma.user.update({
    where: { id },
    data: { subscriptionStatus },
  });

  return NextResponse.json({ id: tenant.id, subscriptionStatus: tenant.subscriptionStatus });
}
