// const request = require("supertest");
// const express = require("express");
// const userRoutes = require("../routes/userRoutes");
// const User = require("../models/User");
// const Post = require("../models/Post");
// const Comment = require("../models/Comment");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");

// const app = express();
// app.use(express.json());
// app.use("/users", userRoutes);

// jest.mock("../models/User");
// jest.mock("../models/Post");
// jest.mock("../models/Comment");
// jest.mock("jsonwebtoken");
// jest.mock("bcryptjs");

// describe("User Routes", () => {
//   beforeEach(() => {
//     jwt.verify.mockImplementation((token, secret, callback) => {
//       callback(null, { userId: "1" });
//     });
//   });

//   describe("POST /users/register", () => {
//     it("should register a new user", async () => {
//       User.findOne.mockResolvedValue(null);
//       User.prototype.save.mockResolvedValue({
//         username: "testuser",
//         email: "test@example.com",
//       });

//       const res = await request(app).post("/users/register").send({
//         username: "testuser",
//         email: "test@example.com",
//         password: "password123",
//       });

//       expect(res.statusCode).toEqual(201);
//       expect(res.body.message).toEqual("User registered successfully");
//     });

//     it("should return 400 if user already exists", async () => {
//       User.findOne.mockResolvedValue({ email: "test@example.com" });

//       const res = await request(app).post("/users/register").send({
//         username: "testuser",
//         email: "test@example.com",
//         password: "password123",
//       });

//       expect(res.statusCode).toEqual(400);
//       expect(res.body.error).toEqual("User already exists");
//     });
//   });

//   describe("POST /users/login", () => {
//     it("should login a user and return tokens", async () => {
//       const user = {
//         id: "1",
//         email: "test@example.com",
//         password: "$2b$10$hashedpassword",
//       };
//       User.findOne.mockResolvedValue(user);
//       bcrypt.compare.mockResolvedValue(true);
//       jwt.sign.mockReturnValue("token");

//       const res = await request(app)
//         .post("/users/login")
//         .send({ email: "test@example.com", password: "password123" });

//       expect(res.statusCode).toEqual(200);
//       expect(res.body).toHaveProperty("accessToken");
//       expect(res.body).toHaveProperty("refreshToken");
//     });

//     it("should return 400 if invalid credentials", async () => {
//       User.findOne.mockResolvedValue(null);

//       const res = await request(app)
//         .post("/users/login")
//         .send({ email: "test@example.com", password: "password123" });

//       expect(res.statusCode).toEqual(400);
//       expect(res.body.error).toEqual("Invalid credentials");
//     });
//   });

//   describe("POST /users/logout", () => {
//     it("should logout a user", async () => {
//       const res = await request(app).post("/users/logout");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.message).toEqual("Logged out successfully");
//     });
//   });

//   describe("GET /users", () => {
//     it("should get all users", async () => {
//       const mockUsers = [{ username: "testuser", email: "test@example.com" }];
//       User.find.mockResolvedValue(mockUsers);

//       const res = await request(app).get("/users");

//       expect(res.statusCode).toEqual(200);
//       expect(Array.isArray(res.body)).toBe(true);
//       expect(res.body.length).toBeGreaterThan(0);
//     });
//   });

//   describe("GET /users/:userId", () => {
//     it("should get a user by ID", async () => {
//       const mockUser = {
//         _id: "1",
//         username: "testuser",
//         email: "test@example.com",
//       };
//       User.findById.mockResolvedValue(mockUser);

//       const res = await request(app).get("/users/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.username).toEqual("testuser");
//     });

//     it("should return 404 if user not found", async () => {
//       User.findById.mockResolvedValue(null);

//       const res = await request(app).get("/users/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("User not found");
//     });
//   });

//   describe("PUT /users/:userId", () => {
//     it("should update a user", async () => {
//       const mockUser = {
//         _id: "1",
//         username: "updateduser",
//         email: "updated@example.com",
//       };
//       User.findByIdAndUpdate.mockResolvedValue(mockUser);

//       const res = await request(app)
//         .put("/users/1")
//         .send({ username: "updateduser", email: "updated@example.com" });

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.username).toEqual("updateduser");
//     });

//     it("should return 404 if user not found", async () => {
//       User.findByIdAndUpdate.mockResolvedValue(null);

//       const res = await request(app)
//         .put("/users/1")
//         .send({ username: "updateduser", email: "updated@example.com" });

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("User not found");
//     });
//   });

//   describe("DELETE /users/:userId", () => {
//     it("should delete a user and associated posts and comments", async () => {
//       User.findByIdAndDelete.mockResolvedValue({
//         _id: "1",
//         username: "testuser",
//       });
//       Post.find.mockResolvedValue([{ _id: "1" }]);
//       Post.deleteMany.mockResolvedValue({ deletedCount: 1 });
//       Comment.deleteMany.mockResolvedValue({ deletedCount: 1 });

//       const res = await request(app).delete("/users/1");

//       expect(res.statusCode).toEqual(200);
//       expect(res.body.message).toEqual(
//         "User, associated posts, and comments deleted"
//       );
//     });

//     it("should return 404 if user not found", async () => {
//       User.findByIdAndDelete.mockResolvedValue(null);

//       const res = await request(app).delete("/users/1");

//       expect(res.statusCode).toEqual(404);
//       expect(res.body.error).toEqual("User not found");
//     });
//   });

//   // describe("POST /users/token", () => {
//   //   it("should refresh tokens", async () => {
//   //     jwt.verify.mockReturnValue({ userId: "1" });
//   //     jwt.sign.mockReturnValue("newToken");

//   //     const res = await request(app)
//   //       .post("/users/token")
//   //       .send({ refresh_token: "validRefreshToken" });

//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body).toHaveProperty("accessToken");
//   //     expect(res.body).toHaveProperty("refreshToken");
//   //   });

//   //   it("should return 403 if invalid token", async () => {
//   //     jwt.verify.mockImplementation(() => {
//   //       throw new Error("Invalid token");
//   //     });

//   //     const res = await request(app)
//   //       .post("/users/token")
//   //       .send({ refresh_token: "invalidRefreshToken" });

//   //     expect(res.statusCode).toEqual(403);
//   //     expect(res.body.error).toEqual("Invalid token");
//   //   });
//   // });
// });
