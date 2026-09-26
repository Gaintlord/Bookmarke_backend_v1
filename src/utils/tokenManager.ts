import dotenv from "dotenv";
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";
import { accessTokenExp, refreshTokenExp } from "./expirationManager";

dotenv.config();
const accessJwtSecret = process.env.JWT_SECRET_A || "SherhiKehde";
const refreshJwtSecret = process.env.JWT_SECRET_R || "cheetahhiKehde";

export type RefreshTokenPayload = JwtPayload & {
  email: string;
  userId: string;
  jwtUid: string;
};

export async function createAccessToken(email: string, userId: string) {
  return jwt.sign({ email, userId }, accessJwtSecret, {
    expiresIn: Math.floor(accessTokenExp / 1000),
  });
}
export async function createRefreshToken(email: string, userId: string) {
  // A refresh token must have an identifier unique to this one session.
  const jwtUid = crypto.randomUUID();
  let refreshToken = jwt.sign({ email, userId, jwtUid }, refreshJwtSecret, {
    expiresIn: Math.floor(refreshTokenExp / 1000),
  });
  return { refreshToken, jwtUid };
}

export async function verifyAccesToken(token: string) {
  try {
    let decoded = jwt.verify(token, accessJwtSecret);
    return decoded;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return {
        status: true,
        err: "expiredToken",
      };
    } else {
      return {
        status: true,
        err: "invalidToken",
      };
    }
  }
}
export async function verifyRefreshToken(token: string) {
  const decoded = jwt.verify(token, refreshJwtSecret);

  if (
    typeof decoded === "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.userId !== "string" ||
    typeof decoded.jwtUid !== "string"
  ) {
    throw new JsonWebTokenError("Malformed refresh token");
  }

  return decoded as RefreshTokenPayload;
}

export function genCSRFString() {
  return crypto.randomBytes(32).toString("hex");
}
