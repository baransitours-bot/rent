import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API - returns SaaS platform branding (no auth required)
export async function GET() {
  const settings = await prisma.systemSettings.findMany({
    where: {
      key: { in: ["platformName", "platformNameEn", "platformLogo", "platformColor", "platformDescription", "platformDescriptionEn"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return NextResponse.json({
    name: map.platformName || "دارك",
    nameEn: map.platformNameEn || "Darak",
    logo: map.platformLogo || "",
    color: map.platformColor || "#b45309",
    description: map.platformDescription || "",
    descriptionEn: map.platformDescriptionEn || "",
  });
}
