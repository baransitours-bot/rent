import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Get user's max images limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxImages: true },
  });
  const maxImages = user?.maxImages || 10;

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const existingCount = parseInt(formData.get("existingCount") as string || "0");

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Enforce image limit
  if (existingCount + files.length > maxImages) {
    return NextResponse.json(
      { error: `Image limit exceeded. Maximum ${maxImages} images allowed.`, maxImages },
      { status: 400 }
    );
  }

  const filePaths: string[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    filePaths.push(`data:${mimeType};base64,${base64}`);
  }

  return NextResponse.json({ paths: filePaths, maxImages });
}
