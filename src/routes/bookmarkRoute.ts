import express from "express";
import { userReqAuth } from "../middleWare/userReqAuth";
import { userSentBookmarkeAuth } from "../middleWare/userSentBookmarkAuth";
import { domainBookmarkList } from "../middleWare/domainBookmarkList";

export const bookmarkeRoute = express.Router();

// bookmarkeRoute.post("/adddata", userReqAuth);
bookmarkeRoute.post("/storelink", userReqAuth,userSentBookmarkeAuth);
bookmarkeRoute.get("/bookmarks", userReqAuth, domainBookmarkList);
