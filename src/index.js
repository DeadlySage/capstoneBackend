const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "1234";
app.use(express.json());

const authRoutes = require("./api/authRoutes");

app.listen(PORT, (req, res, next) => {
  console.log(`I am listening on port number ${PORT}`);
});

app.use("/api/auth", authRoutes);
