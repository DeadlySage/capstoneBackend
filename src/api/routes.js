const express = require("express");
const mainRouter = express.Router();

const authExports = require("./authRoutes");

mainRouter.use("/authRoutes", authExports);



module.exports = mainRouter;