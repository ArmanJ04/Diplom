// FILE: backend/middleware/authMiddleware.js
// Replace your existing authMiddleware.js with this

const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  let token;

  // 1. Check for Authorization header (Bearer token) - This is what your frontend sends
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
    console.log("[AUTH MIDDLEWARE] Token found in Authorization header.");
  }
  // 2. Optional: Fallback to check cookies if no header token (if you still want to support cookie auth for some cases)
  // else if (req.cookies && req.cookies.token) {
  //   token = req.cookies.token;
  //   console.log("[AUTH MIDDLEWARE] Token found in cookies.");
  // }

  if (!token) {
    console.log("[AUTH MIDDLEWARE] No token found in Authorization header (or cookies).");
    return res.status(401).json({ message: "Unauthorized - No token provided." });
  }

  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("[AUTH MIDDLEWARE] Token verification failed:", err.message);
      // Handle specific errors for better client feedback if desired
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Unauthorized - Token expired." });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Unauthorized - Invalid token." });
      }
      return res.status(403).json({ message: "Forbidden - Token is not valid." }); // Generic fallback for other verification errors
    }

    console.log("[AUTH MIDDLEWARE] Token verified successfully. Decoded user:", decoded);
    req.user = decoded; // Attach decoded user (e.g., { userId: '...', role: '...' }) to request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;