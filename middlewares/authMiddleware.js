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

const refreshTokenMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const now = Math.floor(Date.now() / 1000);

    // Check if the token is about to expire (e.g., within 5 minutes)
    if (decoded.exp - now < 300) {
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
      res.setHeader("Refresh-Token", newRefreshToken);
    }

    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = { authMiddleware, refreshTokenMiddleware };
