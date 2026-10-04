import { Request, Response } from "express";
import { genCSRFString } from "../utils/tokenManager";
import {
  googleStateCookieName,
  googleStateCookieOptions,
} from "../utils/authCookies";

const GoogleConsentRed = async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_C_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ err: "Google OAuth is not configured" });
  }

  const CSRFString = genCSRFString();
  const googleOuthQuery = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: CSRFString,
  });

  const toGoogleConsentPage = `https://accounts.google.com/o/oauth2/v2/auth?${googleOuthQuery.toString()}`;
  res.cookie(googleStateCookieName, CSRFString, googleStateCookieOptions);
  return res.redirect(toGoogleConsentPage);
};

export default GoogleConsentRed;
