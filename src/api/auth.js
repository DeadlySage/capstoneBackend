const JWT_SECRET = process.env.JWT_SECRET || "1234";
const { prisma, jwt, bcrypt } = require("../common");
const express = require("express");

const createUser = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 5);
    const response = await prisma.user.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPass,
      },
    });
    if (response) {
      const token = jwt.sign({ id: response.id }, JWT_SECRET, {
        expiresIn: "8h",
      });
      const obj = {
        message: "Registration successful!",
        token: token,
      };
      res.send(obj);
    }
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res
        .status(409)
        .send({ message: "User with this email already exists." }); // 409 Conflict
    }
    next(error);
  }
};

const userLogIn = async (req, res, next) => {
  const response = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });
  if (!response) {
    return res.status(401).send({ message: "Invalid username or password." }); // 401 Unauthorized
  }
  const match = await bcrypt.compare(req.body.password, response.password);
  if (match) {
    const token = jwt.sign({ id: response.id }, JWT_SECRET, {
      expiresIn: "8h",
    });
    const obj = {
      message: "Login successful!",
      token: token,
      user: {
        id: response.id,
        email: response.email,
        firstname: response.firstname,
      },
    };

    res.send(obj);
  } else {
    res.send("incorrect username or password");
  }
};

const userInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const loggedInUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (loggedInUser) {
      const obj = {
        message: "User successfully found",
        user: {
          id: loggedInUser.id,
          email: loggedInUser.email,
          firstname: loggedInUser.firstname,
          lastname: loggedInUser.lastname,
        },
      };
      res.send(obj);
    } else {
      res.status(404).send({ message: "User not found." });
    }
    res.send(userId);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  userLogIn,
  userInfo,
};
