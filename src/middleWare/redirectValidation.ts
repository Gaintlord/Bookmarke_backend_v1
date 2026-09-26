import { Request, RequestHandler, Response } from "express";
import { emailVerify } from "../models/zodDataModel";
import { redirectEmailVerify } from "../controllers/signUpEmailVerifyController";
import {
  accessTokenCookieOptions,
  dashboardRedirectPath,
  dashboardRedirectUrl,
  refreshTokenCookieOptions,
} from "../utils/authCookies";

export const redirectValidation: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const parsedData = emailVerify.safeParse(req.query);

  if (!parsedData.success) {
    res.status(401).json({
      message: "Unsanitized Data query",
    });
  } else {
    const response = await redirectEmailVerify(
      parsedData.data.userEmail,
      parsedData.data.otp,
      req.ip,
      req.get("User-Agent")
    );

    if (response.status) {
      res.cookie("ACCESS_TOKEN", response.accessToken, accessTokenCookieOptions);
      res.cookie("DR_TAG_TOKEN", response.refreshToken, refreshTokenCookieOptions);
      if (req.get("accept")?.includes("text/html")) {
        return res.redirect(303, dashboardRedirectUrl);
      }
      res.status(201).json({
        status: true,
        accessToken: response.accessToken,
        message: response.message,
        redirectTo: dashboardRedirectPath,
      });
    } else {
      res.status(400).json(response.message);
    }
  }
};
