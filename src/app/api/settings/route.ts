import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, uniqueSlug } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      slug: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      companyName: true,
      locale: true,
      currency: true,
      defaultFeeType: true,
      defaultFeeValue: true,
      listInMarketplace: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Auto-generate slug if missing (lazy migration for existing users)
  if (!user.slug) {
    const baseName = user.companyName || user.name || userId;
    const baseSlug = generateSlug(baseName);
    if (baseSlug) {
      const slug = await uniqueSlug(baseSlug, prisma.user, userId);
      await prisma.user.update({ where: { id: userId }, data: { slug } });
      user = { ...user, slug };
    }
  }

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await request.json();

  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.locale !== undefined) data.locale = body.locale;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.defaultFeeType !== undefined) data.defaultFeeType = body.defaultFeeType;
  if (body.defaultFeeValue !== undefined) data.defaultFeeValue = body.defaultFeeValue;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp;
  if (body.companyName !== undefined) data.companyName = body.companyName;
  if (body.listInMarketplace !== undefined) data.listInMarketplace = body.listInMarketplace;

  // Auto-generate slug if name or companyName changed and user has no slug yet
  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true, companyName: true, name: true } });
  const newName = data.companyName ?? currentUser?.companyName ?? data.name ?? currentUser?.name ?? "";
  if (newName && (!currentUser?.slug || data.companyName !== undefined || data.name !== undefined)) {
    const baseSlug = generateSlug(newName);
    if (baseSlug) {
      data.slug = await uniqueSlug(baseSlug, prisma.user, userId);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      slug: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      companyName: true,
      locale: true,
      currency: true,
      defaultFeeType: true,
      defaultFeeValue: true,
      listInMarketplace: true,
    },
  });

  return NextResponse.json(user);
}
