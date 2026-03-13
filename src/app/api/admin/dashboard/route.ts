import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalTenants = await prisma.user.count({ where: { role: "tenant" } });
  const activeTenants = await prisma.user.count({
    where: { role: "tenant", subscriptionStatus: "active" },
  });
  const suspendedAndPaused = await prisma.user.count({
    where: {
      role: "tenant",
      subscriptionStatus: { in: ["suspended", "paused"] },
    },
  });

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringTenants = await prisma.user.findMany({
    where: {
      role: "tenant",
      subscriptionStatus: "active",
      subscriptionExpiryDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionExpiryDate: true,
    },
    orderBy: { subscriptionExpiryDate: "asc" },
  });

  return NextResponse.json({
    totalTenants,
    activeTenants,
    suspendedAndPaused,
    expiringCount: expiringTenants.length,
    expiringTenants,
  });
}
