const router = require("express").Router();

const { getAllUser,getSingleUser,deleteUser,updateAUser } = require("./userController");
const middleware = require("./middleware");

router.all("/all", middleware, getAllUser);
router.get("/:userId",middleware,getSingleUser);


module.exports = router;
