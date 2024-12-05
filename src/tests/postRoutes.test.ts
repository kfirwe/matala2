import request from "supertest";
import express, { Express } from "express";
import postRoutes from "../routes/postRoutes";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use("/posts", postRoutes);

describe("Post Routes", () => {
  let accessToken: string;
  let userId: string;
  let postId: string;

  // Set up real user and post data before tests
  beforeAll(async () => {
    // Set up a connection to the test database
    await mongoose.connect(`${process.env.DATABASE_URL}/test`);

    // Create a real user in the database
    const user = await User.create({
      username: "testuser2",
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
  });

  // Clean up after all tests are run
  afterAll(async () => {
    await Post.deleteMany({}); // Delete all posts
    await User.deleteMany({}); // Delete all users
    await Comment.deleteMany({}); // Delete all comments
    await mongoose.disconnect(); // Close the DB connection
    await mongoose.connection.close(); // Close the DB connection properly
  });

  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Test Post", content: "Test Content", sender: userId });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual("Test Post");
    });

    it("should return 404 if user not found", async () => {
      // Simulate user not found
      const invalidUserId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Test Post",
          content: "Test Content",
          sender: invalidUserId,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("User not found");
    });
  });

  describe("GET /posts", () => {
    it("should get all posts", async () => {
      const res = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0); // Ensure posts exist
      expect(res.body[0].title).toEqual("Test Post");
      expect(res.body[0].sender.username).toEqual("testuser2");
    });
  });

  describe("GET /posts/:postId", () => {
    it("should get a post by ID", async () => {
      const res = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Test Post");
    });

    it("should return 404 if post not found", async () => {
      const post_Id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/posts/${post_Id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Post not found");
    });
  });

  describe("PUT /posts/:postId", () => {
    it("should update a post", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Post", content: "Updated Content" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Updated Post");
    });

    it("should return 404 if post not found", async () => {
      const post_Id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/posts/${post_Id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Post", content: "Updated Content" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Post not found");
    });
  });

  describe("DELETE /posts/:postId", () => {
    it("should delete a post", async () => {
      const res = await request(app)
        .delete(`/posts/${postId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
    });

    it("should return 404 if post not found", async () => {
      const post_Id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/posts/${post_Id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("Post not found");
    });
  });
});
