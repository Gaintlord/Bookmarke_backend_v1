// express call routes , controller and middleweres

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "../routes/userRoutes";
import { bookmarkeRoute } from "../routes/bookmarkRoute";
import { dashboardRoute } from "../routes/dashboardRoute";

export const app = express();

app.use(express.json());
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "*",
  }),
);
app.use(cookieParser());

app.use("/api/v1", userRoutes);
app.use("/api/v1", bookmarkeRoute);
app.use("/api/v1", dashboardRoute);
