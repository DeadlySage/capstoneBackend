const { UpcomingServiceStatus } = require("../../generated/prisma");
const { prisma } = require("../common");

/*
links an upcoming service entry to a service log
*/
const linkUpcomingServiceToServiceLog = async (
  vin,
  serviceLogId,
  serviceType
) => {
  try {
    const upcomingServiceEntry = await prisma.upcomingService.findMany({
      where: {
        carVin: vin,
        serviceType: serviceType,
        status: {
          in: [UpcomingServiceStatus.ACTIVE, UpcomingServiceStatus.SNOOZED],
        },
      },
    });

    if (!upcomingServiceEntry || upcomingServiceEntry.length === 0) return;

    if (upcomingServiceEntry[0].id !== null) {
      const response = await prisma.upcomingService.update({
        where: {
          id: upcomingServiceEntry[0].id,
        },
        data: {
          completedByServiceLogId: serviceLogId,
        },
      });
    }
  } catch (error) {
    console.error("Error linking upcoming service:", error);
  }
};

/*
checks upcomingService table for any entries that are linked to a serviceLog entry
if completedByServiceLogId
*/
const autoCompleteUpcomingService = async (vin) => {
  try {
    const response = await prisma.upcomingService.updateMany({
      where: {
        carVin: vin,
        status: {
          in: [UpcomingServiceStatus.ACTIVE, UpcomingServiceStatus.SNOOZED],
        },
        completedByServiceLogId: {
          not: null,
        },
      },
      data: {
        status: UpcomingServiceStatus.COMPLETE,
      },
    });

    // console.log(`Updated ${response.count} upcoming service(s) to COMPLETE.`);
  } catch (error) {
    console.error("Error auto-completing upcoming service:", error);
  }
};

/*
Creates new entries in upcomingService table for a car based on its current milleage.
For each service interval rule in ServiceIntervalRule table, if there isnt already and active or snoozed 
upcomming service for that serviceType, this function will calculate a 
target mileage (currentMileage + defaultIntervalMiles) and creates a new upcoming service.
*/
const createNewUpcomingService = async (vin, currentMileage) => {
  try {
    // fetch the ServiceIntervalRule table
    const serviceIntervalRules = await prisma.serviceIntervalRule.findMany();

    // iterate through all the service inteval rules
    const upcomingServiceEntries = await Promise.all(
      serviceIntervalRules.map(async (rule) => {
        // check if there already exist a upcomingService entry for this car and serviceType
        const existingService = await prisma.upcomingService.findFirst({
          where: {
            carVin: vin,
            serviceType: rule.serviceType,
            status: {
              in: [UpcomingServiceStatus.ACTIVE, UpcomingServiceStatus.SNOOZED],
            },
          },
        });

        // if upcomingService entry for this car and serviceType does not exist
        if (!existingService) {
          // calculate a new mileage target. for this car and serviceType
          const targetMileage =
            parseInt(currentMileage) + rule.defaultIntervalMiles;
          return {
            carVin: vin,
            serviceType: rule.serviceType,
            targetMileage: parseInt(targetMileage),
            status: UpcomingServiceStatus.ACTIVE,
            serviceDescription: rule.description,
          };
        }
      })
    );

    await prisma.upcomingService.createMany({
      data: upcomingServiceEntries.filter((entry) => entry !== undefined),
    });
  } catch (error) {
    console.error("Error creating new upcomingService entry: ", error);
  }
};

/*
when a user submits a service log entry, call this command to update car mileage to match, if it is greater
*/
const updateCarMileageIfHigher = async (vin, currentMileage) => {
  try {
    // fetch the the current mileage in the car table with unique identifyer vin
    const car = await prisma.car.findUnique({
      where: {
        vin: vin,
      },
      select: {
        mileage: true,
      },
    });

    // if mileage is greater than mileage stored in car table
    if (currentMileage > car.mileage) {
      const updateCar = await prisma.car.update({
        where: {
          vin: vin,
        },
        data: {
          mileage: currentMileage,
        },
      });

      // console.log(`Car mileage updated to ${currentMileage} for VIN: ${vin}`);
      return updateCar;
    } else {
      // console.log(`mileage not updated for VIN: ${vin}`);
    }
  } catch (error) {
    console.error("Error updating car mileage:", error);
  }
};

module.exports = {
  linkUpcomingServiceToServiceLog,
  autoCompleteUpcomingService,
  createNewUpcomingService,
  updateCarMileageIfHigher,
};
