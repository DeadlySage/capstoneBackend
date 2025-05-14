require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const { prisma } = require("../common");

const getAllUser = async (req, res, next) => {
  try {
    const response = await prisma.user.findMany({
      where: {
        OR: [{ activated: null }, { activated: true }],
      },
    });
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

      res.status(200).send(obj);
    } else {
      res.status(404).send({ message: "User not found." });
    }
  } catch (error) {
    next(error);
  }
};

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
    const userData = {};
    const {
      firstname,
      lastname,
      email,
      password,
      street,
      city,
      state,
      postalCode,
      activated,
      deactivatedOn,
    } = req.body;

    if (firstname !== undefined || null) userData.firstname = firstname;
    if (lastname !== undefined || null) userData.lastname = lastname;
    if (email !== undefined || null) userData.email = email;
    if (password !== undefined || null) {
      userData.password = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT)
      );
    }
    if (street !== undefined || null) userData.street = street;
    if (city !== undefined || null) userData.city = city;
    if (state !== undefined || null) userData.state = state;
    if (postalCode !== undefined || null) userData.postalCode = postalCode;
    if (activated !== undefined || null) userData.activated = activated;
    if (deactivatedOn !== undefined || null)
      userData.deactivatedOn = deactivatedOn;

    const response = await prisma.user.update({
      where: {
        id: req.user?.id,
      },
      data: userData,
    });

    res.status(200).send(response);
  }
};

module.exports = {
  getAllUser,
  getSingleUser,
  deleteUser,
  updateAUser,
};
