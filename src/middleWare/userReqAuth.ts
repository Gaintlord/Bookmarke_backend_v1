import { NextFunction, Request, Response } from "express";
import { verifyAccesToken } from "../utils/tokenManager";
// import cookieParser from "cookie-parser";

export const userReqAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerPayload = req.get("authorization");
  const bearerToken = headerPayload?.startsWith("Bearer ")
    ? headerPayload.slice("Bearer ".length)
    : undefined;
  const cookieToken = req.cookies.ACCESS_TOKEN;
  const accessToken =
    typeof cookieToken === "string" ? cookieToken : bearerToken;

  if (!accessToken) {
    return res.status(401).json({ err: "Missing access token" });
  }

  const verifiedToken: any = await verifyAccesToken(accessToken);

  if (verifiedToken.status) {
    if (verifiedToken.err === "expiredToken") {
      return res.status(401).json({
        err: "Access token expired",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    } else {
      return res.status(401).json({ err: "Invalid access token" });
    }
  }
  //@ts-ignore
  req.body = req.body;
  //@ts-ignore
  req.userid = verifiedToken.userId;
  next();
};
