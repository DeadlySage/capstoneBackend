require("dotenv").config();
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
};

const getSingleUser = async (req, res, next) => {
  try {
    const {userId} = req.params;
    const singleUser= await prisma.user.findUnique({
      where:{
        id:userId,
      },
    })
    if (singleUser){
      const obj = {
        id: singleUser.id,
        firstname:singleUser.firstname,
        lastname:singleUser.lastname,
        email:singleUser.email,
      }
      res.send(obj);
    }
    else {
      res.status(404).send({ message: "User not found." });
    }
    res.send(singleUser);
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getAllUser, getSingleUser,
};


