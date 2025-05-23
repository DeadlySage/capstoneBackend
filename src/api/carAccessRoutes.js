const router = require("express").Router();

const {
  givePerms,
  checkPerms,
  getAllPerms,
  deletePerms,
  getAllSharedCars,
} = require("./carAccessController");
const middleware = require("./middleware");

router.post("/givePerms/car/:vin/user/:userId", middleware, givePerms);
router.get("/checkPerms/car/:vin/user/:userId", middleware, checkPerms);
router.get("/getAllPerms/car/:vin", middleware, getAllPerms);
router.delete("/deletePerms/car/:vin/user/:userId", middleware, deletePerms);
router.get("/getAllSharedCars/user/:userId", middleware, getAllSharedCars);

module.exports = router;
