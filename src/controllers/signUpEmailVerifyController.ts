import { eq } from "drizzle-orm";
import { userTableDB } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { deleteOtpFromTable } from "./userTablePatch";
import { createAndStoreTokens } from "./tokenController";

export const redirectEmailVerify = async (
  userEmail: string,
  sentOtp: string,
  userIp: any,
  userAgent: any
) => {
  const data = await db
    .select({
      otp: userTableDB.otp,
      createdAt: userTableDB.createdAt,
      userId: userTableDB.userId,
    })
    .from(userTableDB)
    //@ts-ignore
    .where(eq(userTableDB.userEmail, userEmail));

  console.log(data);
  if (data.length == 0) {
    return {
      status: false,
      message: "Invalid Otp",
    };
  } else {
    const { otp, createdAt, userId } = data[0];
    if (otp === undefined) {
      return {
        status: false,
        message: "unverified",
      };
    }
    if (otp != sentOtp) {
      return {
        status: false,
        message: "Invalid Otp",
      };
    } else {
      const nowTime = new Date(Date.now());
      //@ts-ignore
      const expiredTime = createdAt.getTime() + 30 * 60 * 1000;
      if (nowTime.getTime() < expiredTime) {
        await deleteOtpFromTable(userEmail);
        const { refreshToken, accessToken } = await createAndStoreTokens(
          userEmail,
          userId,
          userIp,
          userAgent
        );
        return {
          refreshToken,
          accessToken,
          status: true,
          message: "verified",
        };
      } else {
        return {
          status: false,
          message: "expired",
        };
      }
    }
  }
};
