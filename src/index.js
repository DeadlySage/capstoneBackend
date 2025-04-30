const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "1234";
app.use(express.json());

const { createUser, userLogIn } = require("./api/auth");

app.listen(PORT, (req, res, next) => {
  console.log(`I am listening on port number ${PORT}`);
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    await createUser(req, res, next);
  } catch (error) {
    next(error);
  }
});
app.post("/api/auth/login", async (req, res, next) => {
  try {
    await userLogIn(req, res, next);
  } catch (error) {
    next(error);
  }
});
