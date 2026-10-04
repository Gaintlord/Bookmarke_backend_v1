import { Request, Response } from "express";
import { revokeRefreshToken } from "../controllers/refreshTokenController";
import { clearSessionCookieOptions } from "../utils/authCookies";

export const logoutSession = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.DR_TAG_TOKEN;

  if (typeof refreshToken === "string") {
    try {
      await revokeRefreshToken(refreshToken);
    } catch {
      // Token invalid or already expired: still clear the cookies below.
    }
  }

  return res
    .clearCookie("ACCESS_TOKEN", clearSessionCookieOptions)
    .clearCookie("N_AT", clearSessionCookieOptions)
    .clearCookie("DR_TAG_TOKEN", clearSessionCookieOptions)
    .status(200)
    .json({ status: true });
};
