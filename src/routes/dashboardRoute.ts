import express from "express";
import { dashboardBookmarkSummary } from "../middleWare/dashboardBookmarkSummary";
import { userReqAuth } from "../middleWare/userReqAuth";

export const dashboardRoute = express.Router();

dashboardRoute.get("/dashboard/bookmark-summary", userReqAuth, dashboardBookmarkSummary);
