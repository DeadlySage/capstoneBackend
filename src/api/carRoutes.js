const router = require("express").Router();

const {
  createCar,
  getAllCar,
  getSingleCar,
  updateMileage,
  deleteCar,
} = require("./carController");
const middleware = require("./middleware");

// full route /api/car
router.post("/:vin", middleware, createCar);
router.get("/all", middleware, getAllCar);
router.get("/:vin", middleware, getSingleCar);
router.put("/:vin", middleware, updateMileage);
router.delete("/:vin", middleware, deleteCar);

module.exports = router;
