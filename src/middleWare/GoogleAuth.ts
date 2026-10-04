import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { findOrCreateGoogleUser } from "../controllers/googleSignUpController";
import { createAndStoreTokens } from "../controllers/tokenController";
import {
  accessTokenCookieOptions,
  dashboardRedirectPath,
  dashboardRedirectUrl,
  googleStateCookieName,
  googleStateCookieOptions,
  loginErrorRedirectUrl,
  refreshTokenCookieOptions,
} from "../utils/authCookies";

const oauthClient = new OAuth2Client();

// clearCookie needs the same attributes as set-cookie, minus the lifetime.
const { maxAge: _stateMaxAge, ...clearStateCookieOptions } =
  googleStateCookieOptions;

const wantsHtml = (req: Request): boolean =>
  req.get("accept")?.includes("text/html") ?? false;

const reject = (
  req: Request,
  res: Response,
  status: number,
  reason: string,
  redirectStatus: string
) => {
  if (wantsHtml(req)) {
    return res.redirect(303, loginErrorRedirectUrl(redirectStatus));
  }
  return res.status(status).json({ status: false, err: reason });
};

const GoogleAuth = async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_C_ID;
  const clientSecret = process.env.GOOGLE_C_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT;

  const { code, state, error } = req.query;
  const userState = req.cookies[googleStateCookieName];

  // The state cookie is single-use; drop it whatever the outcome.
  res.clearCookie(googleStateCookieName, clearStateCookieOptions);

  if (error) {
    return reject(req, res, 401, "Google consent denied", "google_denied");
  }

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    !userState ||
    state !== userState
  ) {
    console.log(`potential CSRF at ${new Date(Date.now())}`);
    return reject(req, res, 403, "unsanitized request", "google_failed");
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return reject(req, res, 500, "Google OAuth is not configured", "google_failed");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.log(
        `google token exchange failed (${tokenResponse.status}) at ${new Date(Date.now())}`
      );
      return reject(req, res, 401, "Google authentication failed", "google_failed");
    }

    const tokenData = (await tokenResponse.json()) as { id_token?: unknown };
    if (typeof tokenData.id_token !== "string") {
      return reject(req, res, 401, "Google authentication failed", "google_failed");
    }

    // verifyIdToken validates the signature against Google's public keys plus
    // the issuer, audience and expiry claims before anything is trusted.
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokenData.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (
      !payload ||
      payload.email_verified !== true ||
      typeof payload.email !== "string" ||
      typeof payload.sub !== "string"
    ) {
      return reject(req, res, 401, "Unverified Google account", "google_unverified");
    }

    const { userId, email } = await findOrCreateGoogleUser({
      email: payload.email,
      googleId: payload.sub,
      name: payload.name ?? null,
    });

    const { refreshToken, accessToken } = await createAndStoreTokens(
      email,
      userId,
      req.ip || "unknown",
      req.get("User-Agent") || "unknown"
    );

    res.cookie("ACCESS_TOKEN", accessToken, accessTokenCookieOptions);
    res.cookie("DR_TAG_TOKEN", refreshToken, refreshTokenCookieOptions);

    if (wantsHtml(req)) {
      return res.redirect(303, dashboardRedirectUrl);
    }

    return res.status(200).json({
      status: true,
      accessToken,
      redirectTo: dashboardRedirectPath,
    });
  } catch (err) {
    console.log(`google auth error at ${new Date(Date.now())}:`, err);
    return reject(req, res, 401, "Google authentication failed", "google_failed");
  }
};

export default GoogleAuth;
