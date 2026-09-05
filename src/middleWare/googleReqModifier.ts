import { Request, Response } from "express";
import { genCSRFString } from "../utils/tokenManager";

const GoogleConsentRed = async (req: Request, res: Response) => {
  let clientId = process.env.GOOGLE_C_ID || " ";
  let redirectUri = process.env.GOOGLE_REDIRECT || "";
  let CSRFString = genCSRFString();
  const googleOuthQuery = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: CSRFString,
  });

  const toGoogleConsentPage = `https://accounts.google.com/o/oauth2/v2/auth?${googleOuthQuery.toString()}`;
  let time = new Date();
  res.cookie("KMTE_STE", CSRFString, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    expires: new Date(Date.now() + 5 * 60 * 1000),
  });
  res.redirect(toGoogleConsentPage);
};

export default GoogleConsentRed;
