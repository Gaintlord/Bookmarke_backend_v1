import { eq } from "drizzle-orm";
import { userTableDB } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { deleteOtpFromTable } from "./userTablePatch";
import { createAndStoreTokens } from "./tokenController";

export type EmailVerifyState = "verified" | "unverified" | "expired";

export type EmailVerifyResult = {
  status: boolean;
  message: EmailVerifyState;
  refreshToken?: string;
  accessToken?: string;
};

export const redirectEmailVerify = async (
  userEmail: string,
  sentOtp: string,
  userIp: any,
  userAgent: any
): Promise<EmailVerifyResult> => {
  const data = await db
    .select({
      otp: userTableDB.otp,
      createdAt: userTableDB.createdAt,
      userId: userTableDB.userId,
    })
    .from(userTableDB)
    //@ts-ignore
    .where(eq(userTableDB.userEmail, userEmail));

  // No account for this email, or the account was never issued an OTP.
  if (data.length === 0) {
    return { status: false, message: "unverified" };
  }

  const { otp, createdAt, userId } = data[0];

  // Reused (otp already null) or wrong OTP is treated as unverified.
  if (otp === null || otp === undefined || otp !== sentOtp) {
    return { status: false, message: "unverified" };
  }

  const nowTime = new Date(Date.now());
  //@ts-ignore
  const expiredTime = createdAt.getTime() + 30 * 60 * 1000;

  if (nowTime.getTime() >= expiredTime) {
    return { status: false, message: "expired" };
  }

  // OTP is valid and unused: consume it so it can never be replayed.
  await deleteOtpFromTable(userEmail);
  const { refreshToken, accessToken } = await createAndStoreTokens(
    userEmail,
    userId,
    userIp,
    userAgent
  );

  return {
    status: true,
    message: "verified",
    refreshToken,
    accessToken,
  };
};
