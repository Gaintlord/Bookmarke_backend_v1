import { Request, Response } from "express";
import { zoduserSignUp } from "../models/zodDataModel";
import { logInUser } from "../controllers/logINController";
import { createAndStoreTokens } from "../controllers/tokenController";
import { refreshTokenExp } from "../utils/expirationManager";
import { refreshTokenRotation } from "../controllers/refreshTokenController";

export const LogInAuthMidware = async (req: Request, res: Response) => {
  const userIp = req.ip || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";
  const cookie = req.cookies;

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
      if (!cookie.DR_TAG_TOKEN) {
        // Access token and Refresh token
        const { refreshToken, accessToken } = await createAndStoreTokens(
          parseData.data.userEmail,
          //@ts-ignore
          response.userId,
          userIp,
          req.get("User-Agent")
        );

        res.cookie("DR_TAG_TOKEN", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false,
          maxAge: refreshTokenExp,
        });
        res.status(200).json({
          status: true,
          accessToken: accessToken,
          dr_tag: refreshToken,
        });
      } else {
        const { newAccessToken, newRefToken } = await refreshTokenRotation(
          cookie.DR_TAG_TOKEN,
          userIp,
          userAgent
        );
        res.cookie("DR_TAG_TOKEN", newRefToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false,
          maxAge: refreshTokenExp,
        });
        res.status(200).json({
          status: true,
          accessToken: newAccessToken,
          dr_tag: newRefToken,
        });
      }
    }
  }
};
