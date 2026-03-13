import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - public, no auth needed (from listing page)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, propertyId, propertyTitle, senderName, senderPhone, message } = body;

  if (!userId || !propertyId || !senderName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      userId,
      propertyId,
      propertyTitle: propertyTitle || "",
      senderName,
      senderPhone: senderPhone || "",
      message: message || "",
    },
  });

  return NextResponse.json(inquiry, { status: 201 });
}

// GET - authenticated tenant sees their inquiries
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const inquiries = await prisma.inquiry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}
