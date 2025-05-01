const router = require("express").Router();

const { getAllUser, updateAUser } = require("./userController");
const middleware = require("./middleware");

router.get("/all", middleware, getAllUser);

router.put("/update/:id", middleware, updateAUser);

module.exports = router;
