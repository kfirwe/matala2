// src/types/express.d.ts

// Augment the Express module globally
export {};

declare global {
  namespace Express {
    // Extend the Request interface to include a `user` property
    interface Request {
      user?: string; // `user` is an optional string (user ID)
    }
  }
}
