import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API - records page views for tenant profiles and properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, propertyId, page } = body;

    if (!userId || !page) {
      return NextResponse.json({ error: "Missing userId or page" }, { status: 400 });
    }

    const referrer = request.headers.get("referer") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    await prisma.pageView.create({
      data: {
        userId,
        propertyId: propertyId || "",
        page,
        referrer,
        userAgent,
        ip,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
