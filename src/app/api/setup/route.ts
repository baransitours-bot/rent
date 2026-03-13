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
      return NextResponse.json({
        success: true,
        message: "Setup already complete. Admin user exists.",
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

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully!",
      login: { email: "admin@rentapp.com", password: "admin123" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
