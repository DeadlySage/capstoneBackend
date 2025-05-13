const { prisma } = require("../common");

const createServiceLog = async (req, res, next) => {
  try {
    const vin = req.params.vin;

    if (!vin || vin == "undefined") {
      return res.status(400).send({
        message: "missing parameters: VIN",
      });
    }

    const serviceLogData = {};
    const {
      // required fields
      mileage,
      serviceType,

      // option fields
      serviceBy,
      serviceCost,
      serviceDetail,
      serviceNote,
    } = req.body;

    // check if all required fields are present
    if (!mileage) {
      return res.status(400).send({
        message: "missing required field: mileage",
      });
    }

    if (!serviceType) {
      return res.status(400).send({
        message: "missing required field: serviceType",
      });
    }

    // construct service log data - required fields
    serviceLogData.carVin = vin;
    serviceLogData.mileage = parseInt(mileage);
    serviceLogData.serviceType = serviceType;

    // construct service log data - optional fields
    if (serviceBy !== undefined || null) serviceLogData.serviceBy = serviceBy;
    if (serviceCost !== undefined || null)
      serviceLogData.serviceCost = parseInt(serviceCost);
    if (serviceDetail !== undefined || null)
      serviceLogData.serviceDetail = serviceDetail;
    if (serviceNote !== undefined || null)
      serviceLogData.serviceNote = serviceNote;

    const response = await prisma.serviceLog.create({
      data: serviceLogData,
    });

    // success condition
    res.status(200).send({
      message: "service log succesfully created",
      data: response,
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2003") {
      res.status(404).send({
        message: "car being referenced does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const getAllServiceLog = async (req, res, next) => {
  try {
    const vin = req.params.vin;

    if (!vin || vin == "undefined") {
      return res.status(400).send({
        message: "missing parameters: VIN",
      });
    }

    // default order of array would be lastest service log first
    const response = await prisma.serviceLog.findMany({
      where: {
        carVin: vin,
      },
      orderBy: {
        performedAt: "desc",
      },
    });

    // success condition
    res.status(200).send(response);
  } catch (error) {
    // fail conditions
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const getServiceLog = async (req, res, next) => {
  try {
    const serviceLogId = req.params.id;

    if (!serviceLogId || serviceLogId == "undefined") {
      return res.status(400).send({
        message: "missing parameters: id",
      });
    }

    const response = await prisma.serviceLog.findFirstOrThrow({
      where: {
        id: serviceLogId,
      },
    });

    // success condition
    res.status(200).send({
      message: "service log found",
      data: response,
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "that service log entry does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const updateServiceLog = async (req, res, next) => {
  try {
    const serviceLogId = req.params.id;

    if (!serviceLogId || serviceLogId == "undefined") {
      return res.status(400).send({
        message: "missing parameters: id",
      });
    }

    const updateServiceLogData = {};

    if (!req.body || req.body == undefined) {
      return res.status(400).send({
        message: "missing JSON",
      });
    }

    const {
      performedAt,
      mileage,
      serviceType,
      serviceBy,
      serviceCost,
      serviceDetail,
      serviceNote,
    } = req.body;

    // construct serviceLogData with fields the user specify
    if (performedAt !== undefined)
      updateServiceLogData.performedAt = performedAt;
    if (mileage !== undefined) updateServiceLogData.mileage = parseInt(mileage);
    if (serviceType !== undefined)
      updateServiceLogData.serviceType = serviceType;
    if (serviceBy !== undefined) updateServiceLogData.serviceBy = serviceBy;
    if (serviceCost !== undefined)
      updateServiceLogData.serviceCost = parseInt(serviceCost);
    if (serviceDetail !== undefined)
      updateServiceLogData.serviceDetail = serviceDetail;
    if (serviceNote !== undefined)
      updateServiceLogData.serviceNote = serviceNote;

    const response = await prisma.serviceLog.update({
      where: {
        id: serviceLogId,
      },
      data: updateServiceLogData,
    });

    // success condition
    res.status(200).send({
      message: "service log succesfully updated",
      data: response,
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "that service log entry does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const deleteServiceLog = async (req, res, next) => {
  try {
    const serviceLogId = req.params.id;

    if (!serviceLogId || serviceLogId == "undefined") {
      return res.status(400).send({
        message: "missing parameters: id",
      });
    }

    const response = await prisma.serviceLog.delete({
      where: {
        id: serviceLogId,
      },
    });

    // success condition
    res.status(204).send();
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "that service log entry does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

module.exports = {
  createServiceLog,
  getAllServiceLog,
  getServiceLog,
  updateServiceLog,
  deleteServiceLog,
};
