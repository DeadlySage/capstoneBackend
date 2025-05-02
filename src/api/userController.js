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

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const authHeader = req.headers.authorization;
    const token = authHeader?.slice(7);
    const verifiedId = jwt.verify(token, JWT_SECRET);

    if (id !== verifiedId.id) {
      res.status(401).send({
        message: "invalid token",
      });
    } else {
      const response = await prisma.user.delete({
        where: {
          id,
        },
      });
      res.send(204);
    }
  } catch (error) {
    res.status(500).send({
      message: "failed to delete",
    });
  }
};
//test
const updateAUser = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(400).send({ message: "User must be logged in." });
  }
  if (req.user?.id !== req.params.id) {
    res.send("Please log in.");
  } else {
    const hashedPass = await bcrypt.hash(req.body.password, 5);
    const response = await prisma.user.update({
      where: {
        id: req.user?.id,
      },
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPass,
      },
    });
    res.status(200).send(response);
  }
};

const getSingleUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const singleUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (singleUser) {
      const obj = {
        id: singleUser.id,
        firstname: singleUser.firstname,
        lastname: singleUser.lastname,
        email: singleUser.email,
      };
      res.send(obj);
    } else {
      res.status(404).send({ message: "User not found." });
    }
    res.send(singleUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUser,
  getSingleUser,
  deleteUser,
  updateAUser,
};
