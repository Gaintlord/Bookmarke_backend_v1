import { Request, RequestHandler, Response } from "express";
import { emailVerify } from "../models/zodDataModel";
import { redirectEmailVerify } from "../controllers/signUpEmailVerifyController";
import { refreshTokenExp } from "../utils/expirationManager";

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
      res.cookie("DR_TAG_TOKEN", response.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: refreshTokenExp,
      });
      res.status(201).json({
        status: true,
        message: response.message,
        accessToken: response.accessToken,
        dr_Tag: response.refreshToken,
      });
    } else {
      res.status(400).json(response.message);
    }
  }
};
