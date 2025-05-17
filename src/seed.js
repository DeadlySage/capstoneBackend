import { PrismaClient } from "../generated/prisma/client.js";
const prisma = new PrismaClient();

// seed Role table with defaults
const getRoles = await prisma.role.findMany();

if (getRoles.length == 0) {
  await prisma.role.createMany({
    data: [
      {
        role: "user",
      },
      {
        role: "mechanic",
      },
      {
        role: "admin",
      },
    ],
  });
}
