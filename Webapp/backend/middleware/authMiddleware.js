const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  let token;

  // 1. Check for Authorization header (Bearer token) - This is what your frontend sends
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
  }

  // Verify the token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden - Token is not valid." });
    }
    req.user = decoded; // Attach decoded user (e.g., { userId: '...', role: '...' }) to request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;
