import request from "supertest";
import express, { Express } from "express";
import commentRoutes from "../routes/commentRoutes";
import Comment from "../models/Comment";
import Post from "../models/Post";
import User from "../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use("/comments", commentRoutes);

describe("Comment Routes", () => {
  let accessToken: string;
  let userId: string;
  let postId: string;
  let commentId: string;

  // Set up a connection to the test database
  beforeAll(async () => {
    await mongoose.connect(`${process.env.DATABASE_URL}/test`);

    // Create a real user in the database
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    userId = (user._id as string).toString();

    // Generate JWT token for the user
    accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
      expiresIn: "15m",
    });

    // Create a real post for the user
    const post = await Post.create({
      title: "Test Post",
      content: "Test Content",
      sender: user._id,
    });

    postId = (post._id as string).toString();

    // Create a real comment for the post
    const comment = await Comment.create({
      content: "Test Comment",
      postId: post._id,
      sender: user._id,
    });

    commentId = (comment._id as string).toString();
  });

  // Clean up after all tests are run
  afterAll(async () => {
    await Comment.deleteMany({}); // Delete all comments
    await Post.deleteMany({}); // Delete all posts
    await User.deleteMany({}); // Delete all users
    await mongoose.disconnect(); // Close the DB connection
  });

  describe("POST /comments", () => {
    it("should create a new comment", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Test Comment", postId, sender: userId });

      expect(res.statusCode).toEqual(201);
      expect(res.body.content).toEqual("Test Comment");
    });

    it("should return 404 if post not found", async () => {
      const invalidPostId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Test Comment",
          postId: invalidPostId,
          sender: userId,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Post not found");
    });

    it("should return 404 if user not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Test Comment", postId, sender: invalidUserId });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("User not found");
    });
  });

  describe("GET /comments", () => {
    it("should get all comments", async () => {
      const res = await request(app)
        .get("/comments")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0); // Ensure comments exist
      expect(res.body[0].content).toEqual("Test Comment");
      expect(res.body[0].postId.title).toEqual("Test Post");
      expect(res.body[0].sender.username).toEqual("testuser");
    });
  });

  describe("GET /comments/:commentId", () => {
    it("should get a comment by ID", async () => {
      const res = await request(app)
        .get(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.content).toEqual("Test Comment");
    });

    it("should return 404 if comment not found", async () => {
      const invalidCommentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/comments/${invalidCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Comment not found");
    });
  });

  describe("PUT /comments/:commentId", () => {
    it("should update a comment", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Updated Comment" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.content).toEqual("Updated Comment");
    });

    it("should return 404 if comment not found", async () => {
      const invalidCommentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/comments/${invalidCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Updated Comment" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Comment not found");
    });
  });

  describe("DELETE /comments/:commentId", () => {
    it("should delete a comment", async () => {
      const res = await request(app)
        .delete(`/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Comment deleted");
    });

    it("should return 404 if comment not found", async () => {
      const invalidCommentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/comments/${invalidCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Comment not found");
    });
  });
});
