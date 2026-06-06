import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "guest@pravaas.dev" },
    update: {},
    create: {
      email: "guest@pravaas.dev",
      password,
      name: "Demo Guest",
    },
  });

  console.log(`Seeded demo user: ${user.email} (password: password123)`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
