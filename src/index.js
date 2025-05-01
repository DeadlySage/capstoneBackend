const express = require("express");
const morgan = require("morgan");

const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

// --- API Router ---
const apiRouter = require("./api/authRoutes"); // Correct path to the api index routerconst userRoutes = require("./api/userRoutes");
const userRoutes = require("./api/userRoutes");

app.use("/api/auth", apiRouter);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
