const router = require("express").Router();

const { getAllUser, deleteUser } = require("./userController");
const middleware = require("./middleware");

router.get("/all", middleware, getAllUser);
router.delete("/delete/:id", middleware, deleteUser)

module.exports = router;
