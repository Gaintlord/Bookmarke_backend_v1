import express, { Router } from "express";
import { signUpauthMidWare } from "../middleWare/signUpAuthMidware";
import { LogInAuthMidware } from "../middleWare/logInAuthMidware";
import { redirectValidation } from "../middleWare/redirectValidation";
import { refreshTokRotate } from "../middleWare/refreshTokenRotate";
import { userReqAuth } from "../middleWare/userReqAuth";
import { sessionCheck } from "../middleWare/sessionCheck";
import GoogleConsentRed from "../middleWare/googleReqModifier";
import GoogleAuth from "../middleWare/GoogleAuth";
import { logoutSession } from "../middleWare/logoutSession";

export const userRoutes: Router = express.Router();

userRoutes.post("/signup", signUpauthMidWare);
userRoutes.post("/login", LogInAuthMidware);
userRoutes.get("/verify-email", redirectValidation);
userRoutes.get("/email-verify", redirectValidation);
userRoutes.get("/auth/refresh", refreshTokRotate);
userRoutes.get("/auth/session", userReqAuth, sessionCheck);
userRoutes.post("/auth/logout", logoutSession);
userRoutes.get("/auth/google", GoogleConsentRed);
userRoutes.get("/googleredirect", GoogleAuth);
