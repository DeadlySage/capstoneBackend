const { prisma } = require("../common");

const createReminder = async (req, res, next) => {
  try {
    const vin = req.params.vin;
    const tittle = req.body.tittle;
    const notes = req.body.notes;

    const response = await prisma.reminder.create({
      data: {
        tittle: tittle,
        notes: notes,
        carVin: vin,
      },
    });

    // success condition
    res.status(200).send({
      message: "reminder created succesfully!",
      data: {
        id: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        tittle: response.tittle,
        notes: response.notes,
        carVin: response.carVin,
      },
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2003") {
      res.status(400).send({
        message: "car being referenced does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const getAllReminder = async (req, res, next) => {
  try {
    const vin = req.params.vin;

    const response = await prisma.reminder.findMany({
      where: {
        carVin: vin,
      },
    });

    // success condition
    res.status(200).send(response);
  } catch (error) {
    // fail condition
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const getReminder = async (req, res, next) => {
  try {
    const reminderId = req.params.id;

    const response = await prisma.reminder.findFirstOrThrow({
      where: {
        id: reminderId,
      },
    });

    // success condition
    res.status(200).send(response);
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "reminder does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const reminderId = req.params.id;

    // extract only fields that are provided
    const tittle = req.body?.tittle;
    const notes = req.body?.notes;
    const updateData = {};

    updateData.tittle = tittle;
    if (notes !== undefined) updateData.notes = notes;

    // If there's nothing to update, return an error
    if (Object.keys(updateData).length === 0) {
      res.status(400).send({
        message: "No fields provided for update",
      });
    }

    const response = await prisma.reminder.update({
      where: {
        id: reminderId,
      },
      data: updateData,
    });

    res.status(200).send({
      message: "Reminder updated succesfully",
      data: response,
    });
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "reminder does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    const reminderId = req.params.id;

    const response = await prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    // success condition
    res.status(204).send();
  } catch (error) {
    // fail conditions
    if (error.code === "P2025") {
      res.status(404).send({
        message: "reminder does not exist",
      });
    } else {
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }
};

module.exports = {
  createReminder,
  getAllReminder,
  getReminder,
  updateReminder,
  deleteReminder,
};
