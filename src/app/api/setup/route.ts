import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function GET() {
  try {
    // Try to create tables by running a simple query first
    // Prisma will auto-create tables on first interaction with db push
    // But since we use migrations, we need to ensure tables exist

    // Check if admin already exists
    let admin;
    try {
      admin = await prisma.user.findUnique({
        where: { email: "admin@rentapp.com" },
      });
    } catch {
      // Tables don't exist yet - this is expected on first run
      // We need to push the schema first
      return NextResponse.json({
        success: false,
        message: "Database tables not found. Please run 'npx prisma db push' with your DATABASE_URL first, then visit this endpoint again to seed the admin user.",
        hint: "You can run this in Vercel's terminal: npx prisma db push",
      });
    }

    if (admin) {
      // Still seed amenities if missing
      const amenityCount = await prisma.amenity.count();
      if (amenityCount === 0) {
        await prisma.amenity.createMany({
          data: [
            { nameAr: "إنترنت / واي فاي", nameEn: "Internet / WiFi", icon: "wifi" },
            { nameAr: "مفروشة", nameEn: "Furnished", icon: "sofa" },
            { nameAr: "غير مفروشة", nameEn: "Unfurnished", icon: "sofa" },
            { nameAr: "موقف سيارات", nameEn: "Parking", icon: "car" },
            { nameAr: "مياه", nameEn: "Water", icon: "droplets" },
            { nameAr: "كهرباء", nameEn: "Electricity", icon: "zap" },
            { nameAr: "تكييف", nameEn: "Air Conditioning", icon: "wind" },
            { nameAr: "مصعد", nameEn: "Elevator", icon: "building" },
            { nameAr: "حراسة أمنية", nameEn: "Security", icon: "shield" },
            { nameAr: "بلكونة", nameEn: "Balcony", icon: "sun" },
            { nameAr: "تلفزيون", nameEn: "TV", icon: "tv" },
            { nameAr: "مطبخ مجهز", nameEn: "Equipped Kitchen", icon: "utensils" },
            { nameAr: "صالة رياضية", nameEn: "Gym", icon: "dumbbell" },
            { nameAr: "مسبح", nameEn: "Swimming Pool", icon: "waves" },
            { nameAr: "حديقة", nameEn: "Garden", icon: "trees" },
            { nameAr: "غاز مركزي", nameEn: "Central Gas", icon: "thermometer" },
          ],
        });
      }
      return NextResponse.json({
        success: true,
        message: "Setup already complete. Admin user exists. Amenities seeded.",
        login: { email: "admin@rentapp.com", password: "admin123" },
      });
    }

    // Create admin user
    const hashedPassword = await bcryptjs.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@rentapp.com",
        password: hashedPassword,
        role: "admin",
        subscriptionStatus: "active",
        locale: "ar",
        currency: "USD",
      },
    });

    // Seed default amenities
    const amenityCount = await prisma.amenity.count();
    if (amenityCount === 0) {
      await prisma.amenity.createMany({
        data: [
          { nameAr: "إنترنت / واي فاي", nameEn: "Internet / WiFi", icon: "wifi" },
          { nameAr: "مفروشة", nameEn: "Furnished", icon: "sofa" },
          { nameAr: "غير مفروشة", nameEn: "Unfurnished", icon: "sofa" },
          { nameAr: "موقف سيارات", nameEn: "Parking", icon: "car" },
          { nameAr: "مياه", nameEn: "Water", icon: "droplets" },
          { nameAr: "كهرباء", nameEn: "Electricity", icon: "zap" },
          { nameAr: "تكييف", nameEn: "Air Conditioning", icon: "wind" },
          { nameAr: "مصعد", nameEn: "Elevator", icon: "building" },
          { nameAr: "حراسة أمنية", nameEn: "Security", icon: "shield" },
          { nameAr: "بلكونة", nameEn: "Balcony", icon: "sun" },
          { nameAr: "تلفزيون", nameEn: "TV", icon: "tv" },
          { nameAr: "مطبخ مجهز", nameEn: "Equipped Kitchen", icon: "utensils" },
          { nameAr: "صالة رياضية", nameEn: "Gym", icon: "dumbbell" },
          { nameAr: "مسبح", nameEn: "Swimming Pool", icon: "waves" },
          { nameAr: "حديقة", nameEn: "Garden", icon: "trees" },
          { nameAr: "غاز مركزي", nameEn: "Central Gas", icon: "thermometer" },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created and default amenities seeded!",
      login: { email: "admin@rentapp.com", password: "admin123" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
