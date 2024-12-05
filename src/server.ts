import dotenv from "dotenv";
import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";
import {
  authMiddleware,
  refreshTokenMiddleware,
} from "./middlewares/authMiddleware";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "../swaggerConfig";

dotenv.config();

const app: Express = express();

// Middleware setup
app.use(bodyParser.json());

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes setup
app.use("/posts", authMiddleware, refreshTokenMiddleware, postRoutes);
app.use("/comments", authMiddleware, refreshTokenMiddleware, commentRoutes);
app.use("/users", userRoutes);

// Database connection and app initialization
const initApp = (): Promise<Express> => {
  return new Promise((resolve, reject) => {
    if (!process.env.DATABASE_URL || !process.env.DB_NAME) {
      reject("Database connection details are missing in .env file");
    } else {
      mongoose
        .connect(`${process.env.DATABASE_URL}/${process.env.DB_NAME}`)
        .then(() => {
          console.log("Connected to MongoDB");
          resolve(app);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

export default initApp;
