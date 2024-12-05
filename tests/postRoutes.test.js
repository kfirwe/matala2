// const request = require("supertest");
// const express = require("express");
// const postRoutes = require("../routes/postRoutes");
// const Post = require("../models/Post");
// const User = require("../models/User");
// const Comment = require("../models/Comment");

// const app = express();
// app.use(express.json());
// app.use("/posts", postRoutes);

// jest.mock("../models/Post");
// jest.mock("../models/User");
// jest.mock("../models/Comment");

// describe("Post Routes", () => {
//   describe("POST /posts", () => {
//     it("should create a new post", async () => {
//       User.findById.mockResolvedValue({ _id: "1", username: "testuser" });
//       Post.create.mockResolvedValue({
//         title: "Test Post",
//         content: "Test Content",
//         sender: "1",
//       });

//       const res = await request(app)
//         .post("/posts")
//         .send({ title: "Test Post", content: "Test Content", sender: "1" });

//       expect(res.statusCode).toEqual(201);
//       expect(res.body.title).toEqual("Test Post");
//     });

//     it("should return 404 if user not found", async () => {
//       User.findById.mockResolvedValue(null);

//       const res = await request(app)
//         .post("/posts")
//         .send({ title: "Test Post", content: "Test Content", sender: "1" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("User not found");
//     });
//   });

//   describe("GET /posts", () => {
//     it("should get all posts", async () => {
//       // Mock data for posts
//       const mockPosts = [
//         {
//           title: "Test Post",
//           content: "Test Content",
//           sender: { _id: "1", username: "testuser" }, // Mock User object
//         },
//       ];

//       // Mock the find function to return a mock query object with populate
//       const mockQuery = {
//         populate: jest.fn().mockReturnThis(), // Mock populate to return the same query object for chaining
//         exec: jest.fn().mockResolvedValue(mockPosts), // Mock exec() to return the mockPosts data
//       };

//       // Mock Post.find() to return the mock query object
//       Post.find = jest.fn().mockReturnValue(mockQuery);

//       // Call the route
//       const res = await request(app).get("/posts");

//       // Log the response body for debugging
//       console.log("Response body:", res.body);

//       // Test the response
//       expect(res.statusCode).toEqual(200);
//       expect(Array.isArray(res.body)).toBe(true); // Ensure response is an array
//       expect(res.body.length).toBeGreaterThan(0); // Ensure we have posts
//     });
//   });

//   describe("GET /posts/:postId", () => {
//     it("should get a post by ID", async () => {
//       const mockPost = {
//         _id: "1",
//         title: "Test Post",
//         content: "Test Content",
//         sender: { _id: "1", username: "testuser" },
//       };

//       Post.findById.mockResolvedValue(mockPost);

//       const res = await request(app).get("/posts/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.title).toEqual("Test Post");
//     });

//     it("should return 404 if post not found", async () => {
//       Post.findById.mockResolvedValue(null);

//       const res = await request(app).get("/posts/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Post not found");
//     });
//   });

//   describe("GET /posts/sender/:senderId", () => {
//     it("should get posts by sender", async () => {
//       const mockPosts = [
//         {
//           title: "Test Post",
//           content: "Test Content",
//           sender: { _id: "1", username: "testuser" },
//         },
//       ];

//       // Mock the find function to return a mock query object with populate
//       const mockQuery = {
//         populate: jest.fn().mockReturnThis(), // Mock populate to return the same query object for chaining
//         exec: jest.fn().mockResolvedValue(mockPosts), // Mock exec() to return the mockPosts data
//       };

//       // Mock Post.find() to return the mock query object
//       Post.find = jest.fn().mockReturnValue(mockQuery);

//       const res = await request(app).get("/posts/sender/1");

//       expect(res.statusCode).toEqual(200);
//       expect(Array.isArray(res.body)).toBe(true); // Ensure response is an array
//       expect(res.body.length).toBeGreaterThan(0); // Ensure we have posts
//     });
//   });

//   describe("PUT /posts/:postId", () => {
//     it("should update a post", async () => {
//       const mockPost = {
//         _id: "1",
//         title: "Updated Post",
//         content: "Updated Content",
//         sender: { _id: "1", username: "testuser" },
//       };

//       Post.findByIdAndUpdate.mockResolvedValue(mockPost);

//       const res = await request(app)
//         .put("/posts/1")
//         .send({ title: "Updated Post", content: "Updated Content" });

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.title).toEqual("Updated Post");
//     });

//     it("should return 404 if post not found", async () => {
//       Post.findByIdAndUpdate.mockResolvedValue(null);

//       const res = await request(app)
//         .put("/posts/1")
//         .send({ title: "Updated Post", content: "Updated Content" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Post not found");
//     });
//   });

//   describe("DELETE /posts/:postId", () => {
//     it("should delete a post and associated comments", async () => {
//       Post.findByIdAndDelete.mockResolvedValue({
//         _id: "1",
//         title: "Test Post",
//       });
//       Comment.deleteMany.mockResolvedValue({ deletedCount: 1 });

//       const res = await request(app).delete("/posts/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.message).toEqual("Post and associated comments deleted");
//     });

//     it("should return 404 if post not found", async () => {
//       Post.findByIdAndDelete.mockResolvedValue(null);

//       const res = await request(app).delete("/posts/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Post not found");
//     });
//   });
// });
