import { CookieOptions } from "express";
import { accessTokenExp, refreshTokenExp } from "./expirationManager";

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: isProduction,
  maxAge: accessTokenExp,
  path: "/",
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: isProduction,
  maxAge: refreshTokenExp,
  path: "/",
};

export const dashboardRedirectPath = "/Dashboard";
const clientOrigin = (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(
  /\/$/,
  ""
);
export const dashboardRedirectUrl = `${clientOrigin}${dashboardRedirectPath}`;
