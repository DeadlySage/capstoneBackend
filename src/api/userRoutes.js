const router = require("express").Router();

const { getAllUser } = require("./userController");
const middleware = require("./middleware");

router.all("/all", middleware, getAllUser);

module.exports = router;
