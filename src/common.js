const { PrismaClient } = require("../generated/prisma/client.js");
const prisma = new PrismaClient();

module.exports = { prisma };
