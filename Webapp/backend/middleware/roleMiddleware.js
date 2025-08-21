const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Forbidden: Role not available on user object." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Role '${req.user.role}' is not authorized for this resource.` });
    }

    next();
  };
};

module.exports = checkRole;
