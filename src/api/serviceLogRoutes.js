const router = require("express").Router();

const {
  createServiceLog,
  getAllServiceLog,
  getServiceLog,
  updateServiceLog,
  deleteServiceLog,
} = require("./serviceLogController");
const middleware = require("./middleware");

router.post("/create/car/:vin", middleware, createServiceLog);
router.get("/getAll/car/:vin", middleware, getAllServiceLog);
router.get("/getServiceLog/:id", middleware, getServiceLog);
router.put("/updateServiceLog/:id", middleware, updateServiceLog);
router.delete("/deleteServiceLog/:id", middleware, deleteServiceLog);

module.exports = router;
