import { Request, Response } from "express";
import { refreshTokenRotation } from "../controllers/refreshTokenController";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/authCookies";

export const refreshTokRotate = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.DR_TAG_TOKEN;
  if (typeof refreshToken !== "string") {
    return res.status(401).json({ err: "Missing refresh token" });
  }

  try {
    const { newAccessToken, newRefToken } = await refreshTokenRotation(
      refreshToken,
      req.ip || "unknown",
      req.get("User-Agent") || "unknown",
    );

    return res
      .status(200)
      .cookie("ACCESS_TOKEN", newAccessToken, accessTokenCookieOptions)
      .cookie("N_AT", newAccessToken, accessTokenCookieOptions)
      .cookie("DR_TAG_TOKEN", newRefToken, refreshTokenCookieOptions)
      .json({ status: true, accessToken: newAccessToken });
  } catch {
    res.clearCookie("ACCESS_TOKEN", accessTokenCookieOptions);
    res.clearCookie("DR_TAG_TOKEN", refreshTokenCookieOptions);
    return res.status(401).json({ err: "Invalid or expired refresh token" });
  }
};
