import { Request, RequestHandler, Response } from "express";
import { emailVerify } from "../models/zodDataModel";
import { redirectEmailVerify } from "../controllers/signUpEmailVerifyController";
import {
  accessTokenCookieOptions,
  dashboardRedirectPath,
  refreshTokenCookieOptions,
  verifyStatusRedirectUrl,
} from "../utils/authCookies";

const wantsHtml = (req: Request): boolean =>
  req.get("accept")?.includes("text/html") ?? false;

export const redirectValidation: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const parsedData = emailVerify.safeParse(req.query);

  if (!parsedData.success) {
    if (wantsHtml(req)) {
      return res.redirect(303, verifyStatusRedirectUrl("unverified"));
    }
    return res.status(401).json({
      message: "Unsanitized Data query",
    });
  }

  const response = await redirectEmailVerify(
    parsedData.data.userEmail,
    parsedData.data.otp,
    req.ip,
    req.get("User-Agent"),
  );

  if (response.status) {
    res.cookie("ACCESS_TOKEN", response.accessToken, accessTokenCookieOptions);
    res.cookie("DR_TAG_TOKEN", response.refreshToken, refreshTokenCookieOptions);

    if (wantsHtml(req)) {
      return res.redirect(303, verifyStatusRedirectUrl(response.message));
    }

    return res.status(201).json({
      status: true,
      accessToken: response.accessToken,
      message: response.message,
      redirectTo: dashboardRedirectPath,
    });
  }

  // Browser/email-link clients always land on the status page, never raw JSON.
  if (wantsHtml(req)) {
    return res.redirect(303, verifyStatusRedirectUrl(response.message));
  }

  return res.status(400).json(response.message);
};
