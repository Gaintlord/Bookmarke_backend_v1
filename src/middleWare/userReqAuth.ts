import { NextFunction, Request, Response } from "express";
import { verifyAccesToken } from "../utils/tokenManager";
// import cookieParser from "cookie-parser";

export const userReqAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerPayload = req.headers["authorization"];
  console.log(headerPayload);
  if (!headerPayload) {
    return res.status(401).json({ err: "Missing Header" });
  }
  if (!headerPayload?.startsWith("Bearer")) {
    return res.status(401).json({ err: "Missing Header" });
  }
  const accessToken = headerPayload?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ err: "Missing Token" });
  }

  const verifiedToken: any = await verifyAccesToken(accessToken);

  if (verifiedToken.status) {
    console.log(verifiedToken.err);
    if (verifiedToken.err === "expiredToken") {
      return res.status(200).header("AC_ERR", "YL203").json({ err: "YL203" });
    } else {
      return res.status(401).json({ err: "Invalid Token" });
    }
  }
  //@ts-ignore
  req.body = req.body;
  //@ts-ignore
  req.userid = verifiedToken.userId;
  next();
};
