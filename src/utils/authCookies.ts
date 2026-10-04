import { CookieOptions } from "express";
import { accessTokenExp, refreshTokenExp } from "./expirationManager";

const isProduction = process.env.NODE_ENV === "production";

// Set COOKIE_DOMAIN (e.g. "bokmarke.world") only when the API is served from a
// different host than the frontend and the cookie must be shared across them.
// Left unset, the cookie is host-only, which is what we want when the frontend
// and API share one origin (Caddy routing both under bokmarke.world).
const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  // "lax" lets the session survive the cross-site top-level navigation that
  // happens when a user opens the verification link from their email client.
  sameSite: "lax",
  secure: isProduction,
  path: "/",
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

export const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: accessTokenExp,
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: refreshTokenExp,
};

// Used to clear the session cookies. Deliberately excludes maxAge: clearCookie
// sets an epoch Expires, but an explicit Max-Age would take precedence over it.
export const clearSessionCookieOptions: CookieOptions = {
  ...baseCookieOptions,
};

// Short-lived CSRF state cookie for the Google OAuth round-trip. It shares the
// session cookie's attributes (notably "lax"), because the callback arrives as
// a cross-site top-level navigation from accounts.google.com.
export const googleStateCookieName = "KMTE_STE";
export const googleStateCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 5 * 60 * 1000,
};

export const dashboardRedirectPath = "/dashboard";
export const verifyStatusPath = "/verify-status";
export const loginPath = "/login";

// CLIENT_ORIGIN may be configured with or without a scheme. A Location header
// needs an absolute URL, so default to https when no scheme is present.
const normalizeOrigin = (origin: string): string => {
  const trimmed = origin.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const clientOrigin = normalizeOrigin(
  process.env.CLIENT_ORIGIN || "http://localhost:3000",
);

export const dashboardRedirectUrl = `${clientOrigin}${dashboardRedirectPath}`;

export const loginErrorRedirectUrl = (status: string): string =>
  `${clientOrigin}${loginPath}?status=${encodeURIComponent(status)}`;

export const verifyStatusRedirectUrl = (status: string): string =>
  `${clientOrigin}${verifyStatusPath}?status=${encodeURIComponent(status)}`;
