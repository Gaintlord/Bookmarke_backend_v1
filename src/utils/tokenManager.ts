import jwt, { TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";

const accessJwtSecret = process.env.JWT_SECRET_A || "SherhiKehde";
const refreshJwtSecret = process.env.JWT_SECRET_R || "cheetahhiKehde";
const jwtUid = crypto.randomUUID();

export async function createAccessToken(email: string, userId: string) {
  return jwt.sign({ email, userId }, accessJwtSecret, { expiresIn: "30s" });
}
export async function createRefreshToken(email: string, userId: string) {
  let refreshToken = jwt.sign({ email, userId, jwtUid }, refreshJwtSecret, {
    expiresIn: "1m",
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
  try {
    const decoded = jwt.verify(token, refreshJwtSecret);
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
export async function decodeRefreshToken(token: string) {
  const decoded = jwt.decode(token);
  return decoded;
}

export function genCSRFString() {
  return crypto.randomBytes(32).toString("hex");
}
