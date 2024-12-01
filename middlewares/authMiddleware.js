const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Request headers:", req.headers);

  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("No Authorization header found");
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  console.log("Authorization header:", authHeader);
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log("No token found after replacing 'Bearer '");
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
