// const request = require("supertest");
// const express = require("express");
// const commentRoutes = require("../routes/commentRoutes");
// const Comment = require("../models/Comment");
// const Post = require("../models/Post");
// const User = require("../models/User");
// const jwt = require("jsonwebtoken");

// const app = express();
// app.use(express.json());
// app.use("/comments", commentRoutes);

// jest.mock("../models/Comment");
// jest.mock("../models/Post");
// jest.mock("../models/User");
// jest.mock("jsonwebtoken");

// describe("Comment Routes", () => {
//   beforeEach(() => {
//     jwt.verify.mockImplementation((token, secret, callback) => {
//       callback(null, { userId: "1" });
//     });
//   });

//   describe("POST /comments", () => {
//     it("should create a new comment", async () => {
//       Post.findById.mockResolvedValue({ _id: "1", title: "Test Post" });
//       User.findById.mockResolvedValue({ _id: "1", username: "testuser" });
//       Comment.create.mockResolvedValue({
//         content: "Test Comment",
//         postId: "1",
//         sender: "1",
//       });

//       const res = await request(app)
//         .post("/comments")
//         .send({ content: "Test Comment", postId: "1", sender: "1" });

//       expect(res.statusCode).toEqual(201);
//       expect(res.body.content).toEqual("Test Comment");
//     });

//     it("should return 404 if post not found", async () => {
//       Post.findById.mockResolvedValue(null);

//       const res = await request(app)
//         .post("/comments")
//         .send({ content: "Test Comment", postId: "1", sender: "1" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Post not found");
//     });

//     it("should return 404 if user not found", async () => {
//       Post.findById.mockResolvedValue({ _id: "1", title: "Test Post" });
//       User.findById.mockResolvedValue(null);

//       const res = await request(app)
//         .post("/comments")
//         .send({ content: "Test Comment", postId: "1", sender: "1" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("User not found");
//     });
//   });

//   describe("GET /comments", () => {
//     it("should get all comments", async () => {
//       // Mock data for comments, posts, and users
//       const mockComments = [
//         {
//           content: "Test Comment",
//           postId: { _id: "1", title: "Test Post" }, // Mock Post object
//           sender: { _id: "1", username: "testuser" }, // Mock User object
//         },
//       ];

//       // Mock the find function to return a mock query object with populate
//       const mockQuery = {
//         populate: jest.fn().mockReturnThis(), // Mock populate to return the same query object for chaining
//         exec: jest.fn().mockResolvedValue(mockComments), // Mock exec() to return the mockComments data
//       };

//       // Mock Comment.find() to return the mock query object
//       Comment.find = jest.fn().mockReturnValue(mockQuery);

//       // Call the route
//       const res = await request(app).get("/comments");

//       // Log the response body for debugging
//       console.log("Response body:", res.body);

//       // Test the response
//       expect(res.statusCode).toEqual(200);
//       expect(Array.isArray(res.body)).toBe(true); // Ensure response is an array
//       expect(res.body.length).toBeGreaterThan(0); // Ensure we have comments
//     });
//   });

//   describe("GET /comments/:commentId", () => {
//     it("should get a comment by ID", async () => {
//       const mockComment = {
//         _id: "1",
//         content: "Test Comment",
//         postId: { _id: "1", title: "Test Post" },
//         sender: { _id: "1", username: "testuser" },
//       };

//       Comment.findById.mockResolvedValue(mockComment);

//       const res = await request(app).get("/comments/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.content).toEqual("Test Comment");
//     });

//     it("should return 404 if comment not found", async () => {
//       Comment.findById.mockResolvedValue(null);

//       const res = await request(app).get("/comments/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Comment not found");
//     });
//   });

//   describe("PUT /comments/:commentId", () => {
//     it("should update a comment", async () => {
//       const mockComment = {
//         _id: "1",
//         content: "Updated Comment",
//         postId: { _id: "1", title: "Test Post" },
//         sender: { _id: "1", username: "testuser" },
//       };

//       Comment.findByIdAndUpdate.mockResolvedValue(mockComment);

//       const res = await request(app)
//         .put("/comments/1")
//         .send({ content: "Updated Comment" });

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.content).toEqual("Updated Comment");
//     });

//     it("should return 404 if comment not found", async () => {
//       Comment.findByIdAndUpdate.mockResolvedValue(null);

//       const res = await request(app)
//         .put("/comments/1")
//         .send({ content: "Updated Comment" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Comment not found");
//     });
//   });

//   describe("DELETE /comments/:commentId", () => {
//     it("should delete a comment", async () => {
//       Comment.findByIdAndDelete.mockResolvedValue({
//         _id: "1",
//         content: "Test Comment",
//       });

//       const res = await request(app).delete("/comments/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.message).toEqual("Comment deleted");
//     });

//     it("should return 404 if comment not found", async () => {
//       Comment.findByIdAndDelete.mockResolvedValue(null);

//       const res = await request(app).delete("/comments/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("Comment not found");
//     });
//   });
// });
