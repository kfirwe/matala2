import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  exp: number;
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  // return type should be `void`

  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret is not defined" });
    }

    const decoded = jwt.verify(token, secret) as DecodedToken; // Type assertion to DecodedToken

    req.user = decoded.userId; // Attach userId to the `req` object
    next(); // Proceed to the next middleware
  } catch {
    return res.status(401).json({ error: "Token is not valid" });
  }
};

const refreshTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  // return type should be `void`
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret is not defined" });
    }
    const decoded = jwt.verify(token, secret, {
      ignoreExpiration: true,
    }) as DecodedToken;
    const now = Math.floor(Date.now() / 1000);

    // Check if the token is about to expire (e.g., within 5 minutes)
    if (decoded.exp - now < 300) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: "JWT secret is not defined" });
      }
      const newAccessToken = jwt.sign({ userId: decoded.userId }, jwtSecret, {
        expiresIn: "15m",
      });

      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        return res
          .status(500)
          .json({ error: "JWT refresh secret is not defined" });
      }
      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        jwtRefreshSecret,
        { expiresIn: "7d" }
      );

      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
      res.setHeader("Refresh-Token", newRefreshToken);
    }

    req.user = decoded.userId;
    next(); // Proceed to the next middleware
  } catch {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export { authMiddleware, refreshTokenMiddleware };
