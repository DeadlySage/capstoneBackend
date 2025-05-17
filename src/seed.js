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

// ServiceIntervalRule defaults
await prisma.serviceIntervalRule.deleteMany();

await prisma.serviceIntervalRule.createMany({
  data: [
    {
      serviceType: "EngineOilAndFilterChange",
      description:
        "Replaces engine oil and filter to lubricate engine components, reduce friction, and remove contaminants. Essential for engine health and performance. Interval can vary significantly with oil type (conventional/synthetic) and vehicle model.",
      defaultIntervalMiles: 5000,
    },
    {
      serviceType: "TireRotation",
      description:
        "Rotating tires promotes even tread wear, extending tire life and maintaining balanced handling.",
      defaultIntervalMiles: 7500,
    },
    {
      serviceType: "breakPadsChange",
      description:
        "worn out break pads can be dangerous, especially in rainy conditions",
      defaultIntervalMiles: 15000,
    },
  ],
});
