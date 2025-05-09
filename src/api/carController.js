require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const { prisma } = require("../common");

const getAllCars = async (req, res, next) => {
  try {
    const response = await prisma.car.findMany();
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAllCars,
};
