const router = require("express").Router();

const { getAllUser } = require("./userController");

router.all("/all", getAllUser);

module.exports = router;