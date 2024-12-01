const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  authMiddleware,
  refreshTokenMiddleware,
} = require("../middlewares/authMiddleware");

// Register a User
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      user = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10),
      });

      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login a User
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const payload = { userId: user.id };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
      });

      res.json({ accessToken, refreshToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Logout a User
router.post("/logout", (req, res) => {
  // Invalidate the refresh token (implementation depends on your token storage strategy)
  res.json({ message: "Logged out successfully" });
});

// Refresh Token
router.post("/token", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(401).json({ error: "Token is required" });
  }

  // Log the token for debugging purposes
  console.log("Received token:", refresh_token);

  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    console.log("Token payload:", payload); // Log the payload for debugging

    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (err) {
    console.error("Token verification error:", err); // Log the error for debugging
    res.status(403).json({ error: "Invalid token" });
  }
});

// Get All Users
router.get("/", authMiddleware, refreshTokenMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a User by ID
router.get(
  "/:userId",
  authMiddleware,
  refreshTokenMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update a User
router.put(
  "/:userId",
  authMiddleware,
  refreshTokenMiddleware,
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;

      if (password) {
        // Check if the password is already hashed
        otherDetails.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        otherDetails,
        {
          new: true,
        }
      );

      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Delete a User
router.delete(
  "/:userId",
  authMiddleware,
  refreshTokenMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Delete the posts associated with the user
      const posts = await Post.find({ sender: req.params.userId });
      const postIds = posts.map((post) => post._id);

      await Post.deleteMany({ sender: req.params.userId });

      // Delete the comments associated with the user's posts
      await Comment.deleteMany({ postId: { $in: postIds } });

      res.json({ message: "User, associated posts, and comments deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
