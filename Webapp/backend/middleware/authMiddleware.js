const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Invalid token:", err.message);
      return res.status(403).json({ message: "Forbidden - Token is not valid." });
    }

    req.user = decoded; // Attach user info to the request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;
