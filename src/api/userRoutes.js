const router = require("express").Router();

const {
  getAllUser,
  getSingleUser,
  deleteUser,
  updateAUser,
} = require("./userController");
const middleware = require("./middleware");

router.get("/all", middleware, getAllUser);

router.get("/:userId", middleware, getSingleUser);

router.delete("/delete/:id", middleware, deleteUser);

router.put("/update/:id", middleware, updateAUser);

module.exports = router;
