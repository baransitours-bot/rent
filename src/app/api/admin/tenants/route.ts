import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcryptjs from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await prisma.user.findMany({
    where: { role: "tenant" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyName: true,
      currency: true,
      locale: true,
      subscriptionStatus: true,
      subscriptionStartDate: true,
      subscriptionExpiryDate: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password, phone, companyName, currency, locale, subscriptionStatus, subscriptionStartDate, subscriptionExpiryDate } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const tenant = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      companyName: companyName || "",
      currency: currency || "USD",
      locale: locale || "ar",
      role: "tenant",
      subscriptionStatus: subscriptionStatus || "active",
      subscriptionStartDate: subscriptionStartDate ? new Date(subscriptionStartDate) : new Date(),
      subscriptionExpiryDate: subscriptionExpiryDate ? new Date(subscriptionExpiryDate) : null,
    },
  });

  return NextResponse.json({ id: tenant.id, name: tenant.name, email: tenant.email }, { status: 201 });
}
