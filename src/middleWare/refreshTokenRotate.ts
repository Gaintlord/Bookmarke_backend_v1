import { Request, Response } from "express";
import {
  createAccessToken,
  decodeRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenManager";
import { refreshTokenRotation } from "../controllers/refreshTokenController";
import { refreshTokenExp } from "../utils/expirationManager";

export const refreshTokRotate = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.DR_TAG_TOKEN || req.query.tags;
  console.log(refreshToken);
  const verifiedRefToken = await verifyRefreshToken(refreshToken);

  //@ts-ignore

  if (verifiedRefToken.status) {
    //@ts-ignore
    if (verifiedRefToken.err == "expiredToken") {
      //@ts-ignore
      console.log("!!!!!!!!!! ref token expired !!!!!!!!!");
      const { newAccessToken, newRefToken } = await refreshTokenRotation(
        refreshToken,
        req.ip || "unkown",
        req.get("User-Agent") || "unknown",
      );
      return res
        .status(201)
        .header("N_AT", newAccessToken)
        .header("N_RT", newRefToken)
        .cookie("DR_TAG_TOKEN", newRefToken, {
          httpOnly: true,
          sameSite: true,
          maxAge: refreshTokenExp,
          secure: false,
        })
        .json({ accessToken: newAccessToken });
    } else {
      return res.status(401).json({ err: "Invalid Token" });
    }
    console.log(verifiedRefToken);
  } else {
    console.log("### ref token exist & made new access Token ###");
    const newAccessToken = await createAccessToken(
      //@ts-ignore
      verifiedRefToken.email as string,
      //@ts-ignore
      verifiedRefToken.userId as string,
    );
    return res
      .status(201)
      .header("N_AT", newAccessToken)
      .json({ accessToken: newAccessToken });
  }
};
