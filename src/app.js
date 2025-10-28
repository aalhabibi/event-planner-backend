import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import * as middleware from "./middleware/error.js";
import helloRoute from "./routes/helloRouter.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
connectDB();

const app = express();

// parse json request body
app.use(express.json());

// for x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());

// request logger middleware
app.use(morgan("tiny"));

// healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// routes

app.use("/api/hello", helloRoute);
app.use("/api/auth", authRoutes);

// custom middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
