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

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  // Start of this week (Sunday)
  const weekDay = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - weekDay);
  weekStart.setHours(0, 0, 0, 0);

  const [totalViews, monthViews, weekViews, profileViews, propertyViewsRaw] = await Promise.all([
    prisma.pageView.count({ where: { userId } }),
    prisma.pageView.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.pageView.count({ where: { userId, createdAt: { gte: weekStart } } }),
    prisma.pageView.count({ where: { userId, page: "profile" } }),
    prisma.pageView.groupBy({
      by: ["propertyId"],
      where: { userId, propertyId: { not: "" } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  // Get property titles for top viewed
  const propertyIds = propertyViewsRaw.map((p) => p.propertyId);
  const properties = propertyIds.length > 0
    ? await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, title: true, slug: true },
      })
    : [];

  const propMap = new Map(properties.map((p) => [p.id, p]));

  const topProperties = propertyViewsRaw.map((pv) => ({
    propertyId: pv.propertyId,
    title: propMap.get(pv.propertyId)?.title || "Unknown",
    slug: propMap.get(pv.propertyId)?.slug || "",
    views: pv._count.id,
  }));

  // Daily views for last 30 days (for chart)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyViews = await prisma.pageView.groupBy({
    by: ["createdAt"],
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  });

  // Aggregate by date string
  const dailyMap: Record<string, number> = {};
  for (const dv of dailyViews) {
    const dateStr = new Date(dv.createdAt).toISOString().split("T")[0];
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + dv._count.id;
  }

  // Fill in all 30 days
  const dailyChart: Array<{ date: string; views: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyChart.push({ date: dateStr, views: dailyMap[dateStr] || 0 });
  }

  return NextResponse.json({
    totalViews,
    monthViews,
    weekViews,
    profileViews,
    propertyViews: totalViews - profileViews,
    topProperties,
    dailyChart,
  });
}
