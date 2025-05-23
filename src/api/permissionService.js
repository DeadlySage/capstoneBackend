const { prisma } = require("../common");

const hasOwnerPerms = async (vin, ownerId) => {
  try {
    // query prisma for car information
    const carInfo = await prisma.car.findFirst({
      where: {
        vin: vin,
      },
    });

    // check if token has permisions
    if (carInfo.userId == ownerId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // console.error("Error checking owner permissions: ", error);
    return false;
  }
};

const hasAccessPerms = async (vin, userId) => {
  try {
    const accessInfo = await prisma.carAccess.findMany({
      where: {
        carVin: vin,
        userId: userId,
      },
    });

    // check if userId has permisions
    if (accessInfo.length !== 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking access permissions: ", error);
    return false;
  }
};

module.exports = {
  hasOwnerPerms,
  hasAccessPerms,
};
