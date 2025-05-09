const router = require("express").Router();

const { getAllCars } = require("./carController");
const middleware = require("./middleware");

router.get("/all", middleware, getAllCars);
