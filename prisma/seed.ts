import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcryptjs.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@rentapp.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@rentapp.com",
      password: hashedPassword,
      role: "admin",
      subscriptionStatus: "active",
      locale: "ar",
      currency: "USD",
    },
  });

  console.log("Admin seeded: admin@rentapp.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
