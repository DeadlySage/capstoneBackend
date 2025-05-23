const { prisma } = require("../common");
const { hasOwnerPerms } = require("./permissionService");

const givePerms = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    const userId = req.params.userId;
    const ownerId = req.user.id;

    // check if token has permisions
    if ((await hasOwnerPerms(vin, ownerId)) == false) {
      return res.status(403).send({
        message: "you do not have permmision",
      });
    }

    const response = await prisma.carAccess.create({
      data: {
        userId: userId,
        carVin: vin,
      },
    });

    res.status(200).send({
      message: `succesfull given ${userId} permissions to vin: ${vin}`,
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2003") {
      res.status(404).send({
        message: "car and/or user being referenced does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const checkPerms = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    const userId = req.params.userId;

    const response = await prisma.carAccess.findMany({
      where: {
        carVin: vin,
        userId: userId,
      },
    });

    if (response.length == 0) {
      res.status(403).send({
        message: "user do not have permission",
      });
    } else {
      res.status(200).send({
        message: "User has permission",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getAllPerms = async (req, res, next) => {
  try {
    const vin = req.params.vin;

    const response = await prisma.carAccess.findMany({
      where: {
        carVin: vin,
      },
    });

    res.status(200).send({
      message: "succesfully fetched all permission rules attached this vin",
      data: response,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const deletePerms = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    const userId = req.params.userId;
    const ownerId = req.user.id;

    // check if token has permisions
    if ((await hasOwnerPerms(vin, ownerId)) == false) {
      return res.status(401).send({
        message: "you do not have permmision",
      });
    }

    const permission = await prisma.carAccess.findFirstOrThrow({
      where: {
        carVin: vin,
        userId: userId,
      },
    });

    const response = prisma.carAccess.delete({
      where: {
        id: permission.id,
      },
    });

    // success condition
    res.status(204).send();
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "permission setting does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const getAllSharedCars = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const carVins = await prisma.carAccess.findMany({
      where: {
        userId: userId,
      },
    });

    if (carVins.length == 0) {
      return res.status(204).send();
    }

    const vinList = carVins.map((car) => car.carVin);

    const listOfSharedCars = await prisma.car.findMany({
      where: {
        vin: {
          in: vinList,
        },
      },
    });

    //success condition
    res.status(200).send({
      message: "succesfull fetch list of all cars shared to this user",
      data: listOfSharedCars,
    });
  } catch (error) {
    //fail condition
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  givePerms,
  checkPerms,
  getAllPerms,
  deletePerms,
  getAllSharedCars,
};
