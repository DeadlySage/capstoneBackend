const router = require("express").Router();

const { createUser, userLogIn } = require("./auth");

router.post("/register", createUser);
router.post("/login", userLogIn);

module.exports = router;
