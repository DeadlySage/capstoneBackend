const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

// seed Role table with defaults
async function roles() {
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
        serviceType: "Oil Change",
        description:
          "Replaces engine oil and filter to lubricate engine components, reduce friction, and remove contaminants. Essential for engine health and performance. Interval can vary significantly with oil type (conventional/synthetic) and vehicle model.",
        defaultIntervalMiles: 5000,
        createOrderIndex: 1,
      },
      {
        serviceType: "Tire Rotation",
        description:
          "Rotating tires promotes even tread wear, extending tire life and maintaining balanced handling.",
        defaultIntervalMiles: 7500,
        createOrderIndex: 2,
      },
      {
        serviceType: "Replace Air Filter",
        description:
          "Replacing the air filter helps ensure optimal air flow to the engine, improving fuel efficiency and reducing engine strain. The interval can vary depending on driving conditions, particularly in dusty environments.",
        defaultIntervalMiles: 12000,
        createOrderIndex: 3,
      },
      {
        serviceType: "Change Break Pads",
        description:
          "worn out break pads can be dangerous, especially in rainy conditions",
        defaultIntervalMiles: 15000,
        createOrderIndex: 4,
      },
      {
        serviceType: "Brake Fluid Flush",
        description:
          "Brake fluid absorbs moisture over time, which can cause corrosion and reduced braking performance. A brake fluid flush is recommended to maintain proper braking function and safety.",
        defaultIntervalMiles: 30000,
        createOrderIndex: 5,
      },
      {
        serviceType: "Replace Tires",
        description:
          "Replacing tires is crucial for maintaining vehicle safety, handling, and performance. Worn-out tires can reduce traction, increase stopping distances, and lead to poor handling, especially in wet or slippery conditions. Tire replacement is generally recommended when the tread depth reaches 2/32 of an inch or if the tires show signs of damage such as cracks or punctures. Tire replacement intervals vary based on driving conditions, tire type, and vehicle usage, but on average, tires should be replaced every 25,000 to 50,000 miles.",
        defaultIntervalMiles: 40000,
        createOrderIndex: 6,
      },
      {
        serviceType: "Replace Battery",
        description:
          "Replacing the vehicle's battery is essential for ensuring reliable engine starts and proper functioning of electrical components. Battery life can vary based on factors such as driving habits, climate, and the age of the battery. Typically, it’s recommended to replace the battery every 3 to 5 years, but performance issues like slow starts or dimming lights may indicate it's time to replace it sooner.",
        defaultIntervalMiles: 50000,
        createOrderIndex: 7,
      },
      {
        serviceType: "Replace Timing Belt",
        description:
          "The timing belt keeps the engine's camshaft and crankshaft in sync. Replace it at the recommended intervals to prevent engine damage. Timing belt failure can result in catastrophic engine failure.",
        defaultIntervalMiles: 60000,
        createOrderIndex: 8,
      },
    ],
  });
}
roles();
