const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) return res.status(403).json({ error: "No token provided" });
  if (!jwtSecret) return res.status(500).json({ error: "JWT secret is not configured" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
