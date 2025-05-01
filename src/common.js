
const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = { prisma, jwt, bcrypt };