import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.app.upsert({
    where: { id: "finaly" },
    update: { status: "published" },
    create: {
      id: "finaly",
      name: "Finaly",
      description: "Finaly app",
      is_active: true,
      status: "published",
    },
  });
  await prisma.app.upsert({
    where: { id: "ent" },
    update: { status: "published" },
    create: {
      id: "ent",
      name: "ENT",
      description: "ENT app",
      is_active: true,
      status: "published",
    },
  });
  console.log("Seed: apps Finaly and ENT created/updated.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
