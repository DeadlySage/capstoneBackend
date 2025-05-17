const router = require("express").Router();

const {
  getAllDueUpcomingService,
  getAllUpcomingService,
  getAllCompletedUpcomingService,
} = require("./upcomingServiceController");

const middleware = require("./middleware");

router.get("/getAllUpcoming/car/:vin", middleware, getAllUpcomingService);
router.get("/getAllDueUpcoming/car/:vin", middleware, getAllDueUpcomingService);
router.get("/getAllCompletedUpcoming/car/:vin", middleware, getAllCompletedUpcomingService);

module.exports = router;
