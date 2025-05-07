const jwt = require('jsonwebtoken'); // Import JWT

async function middleware(req, res, next) {
    const authHeader = req.headers?.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ message: "Access denied. Invalid token format." });
    }
  
    const token = authHeader.split(" ")[1];
  
    if (!token) {
      return res
        .status(401)
        .send({ message: "Access denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      next(error);
    }
  }
  
  module.exports = middleware;