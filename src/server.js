const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

// --- API Router ---
const apiRouter = require("./api/authRoutes"); // Correct path to the api index routerconst userRoutes = require("./api/userRoutes");
const userRoutes = require("./api/userRoutes");
const carRoutes = require("./api/carRoutes");
const reminderRoutes = require("./api/reminderRoutes.js");

app.use("/api/auth", apiRouter);
app.use("/api/user", userRoutes);
app.use("/api/car", carRoutes);
app.use("/api/reminder", reminderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

module.exports = app;
