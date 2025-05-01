const router = require("express").Router();
const express = require('express');

const { createUser, userLogIn, userInfo } = require("./auth");
const middleware = require("./middleware");

router.post("/register", createUser);
router.post("/login", userLogIn);
router.get("/me",middleware, userInfo);

module.exports = router;
