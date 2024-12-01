const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// Create a Comment
router.post("/", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find().populate("sender").populate("postId");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a Comment by ID
router.get("/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("sender")
      .populate("postId");
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a Comment
router.put("/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      {
        new: true,
      }
    )
      .populate("sender")
      .populate("postId");
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a Comment
router.delete("/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
