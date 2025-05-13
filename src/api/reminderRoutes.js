const router = require("express").Router();

const {
  createReminder,
  getAllReminder,
  getReminder,
  updateReminder,
  deleteReminder,
} = require("../api/reminderController");
const middleware = require("./middleware");

router.post("/create/car/:vin", middleware, createReminder);
router.get("/getAll/car/:vin", middleware, getAllReminder);
router.get("/getReminder/:id", middleware, getReminder);
router.put("/updateReminder/:id", middleware, updateReminder);
router.delete("/deleteReminder/:id", middleware, deleteReminder);

module.exports = router;
