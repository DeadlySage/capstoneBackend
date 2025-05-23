const { UpcomingServiceStatus } = require("../../generated/prisma");
const { prisma } = require("../common");
const { isValidVin } = require("./vinDecoder");

const getAllDueUpcomingService = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    
    if (await isValidVin(vin) == false) {
      return res.status(400).send({
        message: "missing valid parameters: VIN",
      });
    }

    // grab the current mileage of a car
    const currentMileage = await prisma.car.findUnique({
      where: {
        vin: vin,
      },
      select: {
        mileage: true,
      },
    });

    const response = await prisma.upcomingService.findMany({
      where: {
        carVin: vin,
        targetMileage: {
          lt: currentMileage.mileage,
        },
      },
      orderBy: {
        targetMileage: "asc",
      },
    });

    // success condition
    res.status(200).send({
      message: "succesfully retrived all upcoming services that are due",
      data: response,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const getAllUpcomingService = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    
    if (await isValidVin(vin) == false) {
      return res.status(400).send({
        message: "missing valid parameters: VIN",
      });
    }

    const response = await prisma.upcomingService.findMany({
      where: {
        carVin: vin,
        status: {
          in: [UpcomingServiceStatus.ACTIVE, UpcomingServiceStatus.SNOOZED],
        },
      },
      orderBy: {
        targetMileage: 'asc',
      },
    });

    // succes condition
    res.status(200).send({
      message: "succesfully retrived all upcoming services",
      data: response,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const getAllCompletedUpcomingService = async (req, res, next) => {
  try {
    const vin = req.params.vin;

    if (await isValidVin(vin) == false) {
      return res.status(400).send({
        message: "missing valid parameters: VIN",
      });
    }

    const response = await prisma.upcomingService.findMany({
      where: {
        carVin: vin,
        status: UpcomingServiceStatus.COMPLETE,
      },
      orderBy: {
        targetMileage: "desc",
      },
    });

    // success condition
    res.status(200).send({
      message: "succesfully retrived all upcoming services that are completed",
      data: response,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllDueUpcomingService,
  getAllUpcomingService,
  getAllCompletedUpcomingService,
};
