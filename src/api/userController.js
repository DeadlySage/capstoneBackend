require('dotenv').config();
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const { prisma } = require("../common");

const getAllUser = async (req, res, next) => {
  try {
    const response = await prisma.user.findMany();
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUser,
}