import request from "supertest";
import express, { Express, Request, Response, NextFunction } from "express";
import userRoutes from "../routes/userRoutes";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use("/users", userRoutes);

jest.mock("../models/User");
jest.mock("../models/Post");
jest.mock("../models/Comment");
jest.mock("bcryptjs");

// Mock the authentication middleware
jest.mock("../middlewares/authMiddleware", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction): void =>
    next(),
  refreshTokenMiddleware: (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => next(),
}));

describe("User Routes", () => {
  let accessToken: string;
  let refreshToken: string;

  beforeEach(() => {
    accessToken = jwt.sign(
      { userId: "1" },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "15m",
      }
    );
    refreshToken = jwt.sign(
      { userId: "1" },
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
      {
        expiresIn: "7d",
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users/register", () => {
    it("should register a new user", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.prototype.save as jest.Mock).mockResolvedValue({
        username: "testuser3",
        email: "test@example.com",
      });

      const res = await request(app).post("/users/register").send({
        username: "testuser3",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual("User registered successfully");
    });

    it("should return 400 if user already exists", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      const res = await request(app).post("/users/register").send({
        username: "testuser3",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("User already exists");
    });
  });

  describe("POST /users/login", () => {
    it("should login a user and return tokens", async () => {
      const user = {
        id: "1",
        email: "test@example.com",
        password: "$2b$10$hashedpassword",
      };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should return 400 if invalid credentials", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Invalid credentials");
    });
  });

  describe("POST /users/logout", () => {
    it("should logout a user", async () => {
      const res = await request(app).post("/users/logout");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Logged out successfully");
    });
  });

  describe("GET /users", () => {
    it("should get all users", async () => {
      const mockUsers = [{ username: "testuser3", email: "test@example.com" }];
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /users/:userId", () => {
    it("should get a user by ID", async () => {
      const mockUser = {
        _id: "1",
        username: "testuser3",
        email: "test@example.com",
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .get("/users/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual("testuser3");
    });

    it("should return 404 if user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/users/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("User not found");
    });
  });

  describe("PUT /users/:userId", () => {
    it("should update a user", async () => {
      const mockUser = {
        _id: "1",
        username: "updateduser",
        email: "updated@example.com",
      };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .put("/users/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "updateduser", email: "updated@example.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual("updateduser");
    });

    it("should return 404 if user not found", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/users/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "updateduser", email: "updated@example.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("User not found");
    });
  });

  describe("DELETE /users/:userId", () => {
    it("should delete a user and associated posts and comments", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: "1",
        username: "testuser3",
      });
      (Post.find as jest.Mock).mockResolvedValue([{ _id: "1" }]);
      (Post.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (Comment.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const res = await request(app)
        .delete("/users/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual(
        "User, associated posts, and comments deleted"
      );
    });

    it("should return 404 if user not found", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/users/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual("User not found");
    });
  });

  describe("POST /users/token", () => {
    it("should refresh tokens", async () => {
      const res = await request(app)
        .post("/users/token")
        .send({ refresh_token: refreshToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("should return 403 if invalid token", async () => {
      const res = await request(app)
        .post("/users/token")
        .send({ refresh_token: "invalidRefreshToken" });

      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toEqual("Invalid token");
    });
  });
});
