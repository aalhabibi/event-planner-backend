import * as logger from "../utils/logger.js";
import mongoose from "mongoose";

export const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "unknown endpoint" });
};

export const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  // Handle Mongoose bad ObjectId (CastError)
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).json({ error: "malformatted id" });
  }

  // Handle validation errors from Mongoose
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  // Handle duplicate key (like duplicate email)
  if (error.code === 11000) {
    return res.status(400).json({ error: "Duplicate field value" });
  }

  // JWT or auth-related errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // Default: unhandled errors
  return res.status(500).json({ error: "Internal Server Error" });
};
