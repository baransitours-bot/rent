import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.systemSettings.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return NextResponse.json({
    gaTrackingId: map.gaTrackingId || "",
    defaultMaxImages: parseInt(map.defaultMaxImages || "10"),
    platformName: map.platformName || "دارك",
    platformNameEn: map.platformNameEn || "Darak",
    platformLogo: map.platformLogo || "",
    platformColor: map.platformColor || "#b45309",
    platformDescription: map.platformDescription || "",
    platformDescriptionEn: map.platformDescriptionEn || "",
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Array<{ key: string; value: string }> = [];
  if (body.gaTrackingId !== undefined) {
    updates.push({ key: "gaTrackingId", value: body.gaTrackingId });
  }
  if (body.defaultMaxImages !== undefined) {
    updates.push({ key: "defaultMaxImages", value: String(body.defaultMaxImages) });
  }
  const brandingKeys = ["platformName", "platformNameEn", "platformLogo", "platformColor", "platformDescription", "platformDescriptionEn"];
  for (const k of brandingKeys) {
    if (body[k] !== undefined) {
      updates.push({ key: k, value: body[k] });
    }
  }

  for (const { key, value } of updates) {
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  return NextResponse.json({ success: true });
}
