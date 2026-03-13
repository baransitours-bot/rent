import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - list agents (tenants who opted into marketplace)
export async function GET() {
  const agents = await prisma.user.findMany({
    where: {
      role: "tenant",
      listInMarketplace: true,
      subscriptionStatus: { in: ["active", "paused"] },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      companyName: true,
      phone: true,
      whatsapp: true,
      _count: {
        select: {
          properties: {
            where: { status: "available" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(agents);
}
