const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

// Add a New Post
router.post("/", async (req, res) => {
  const { sender } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the post
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("sender");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a Post by ID
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("sender");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Posts by Sender
router.get("/sender/:senderId", async (req, res) => {
  try {
    const posts = await Post.find({ sender: req.params.senderId }).populate(
      "sender"
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a Post
router.put("/:postId", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, req.body, {
      new: true,
    }).populate("sender");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a Post
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Delete the comments associated with the post
    await Comment.deleteMany({ postId: req.params.postId });

    res.json({ message: "Post and associated comments deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
