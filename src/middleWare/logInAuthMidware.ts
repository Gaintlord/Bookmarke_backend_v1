import { Request, Response } from "express";
import { zoduserSignUp } from "../models/zodDataModel";
import { logInUser } from "../controllers/logINController";
import { createAndStoreTokens } from "../controllers/tokenController";
import {
  accessTokenCookieOptions,
  dashboardRedirectPath,
  dashboardRedirectUrl,
  refreshTokenCookieOptions,
} from "../utils/authCookies";

export const LogInAuthMidware = async (req: Request, res: Response) => {
  const userIp = req.ip || "unknown";

  const parseData = zoduserSignUp.safeParse(req.body);

  if (!parseData.success) {
    res.status(401).json({
      status: false,
    });
  } else {
    const response = await logInUser(parseData.data);

    if (!response.status) {
      res.status(401).json({
        status: false,
        err: "unsanitized credentials",
      });
    } else {
      // A successful password login creates a new session; it never trusts an
      // existing browser cookie as proof of identity.
      const { refreshToken, accessToken } = await createAndStoreTokens(
        parseData.data.userEmail,
        //@ts-ignore
        response.userId,
        userIp,
        req.get("User-Agent") || "unknown"
      );

      res.cookie("ACCESS_TOKEN", accessToken, accessTokenCookieOptions);
      res.cookie("DR_TAG_TOKEN", refreshToken, refreshTokenCookieOptions);
      if (req.get("accept")?.includes("text/html")) {
        return res.redirect(303, dashboardRedirectUrl);
      }
      res.status(200).json({
        status: true,
        accessToken,
        redirectTo: dashboardRedirectPath,
      });
    }
  }
};
