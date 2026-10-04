import { eq } from "drizzle-orm";
import { userTableDB } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { hashVerify } from "../utils/hashingUtil";

export const logInUser = async (data: {
  userEmail: string;
  userPassword: string;
}) => {
  const { userEmail, userPassword } = data;

  //getiing hashed pass from DB
  const userHashedPassNotp = await db
    .select({
      userId: userTableDB.userId,
      userPassword: userTableDB.userPassword,
      otp: userTableDB.otp,
    })
    .from(userTableDB)
    .where(eq(userTableDB.userEmail, userEmail));

  if (!userHashedPassNotp.length) {
    return { status: false };
  }
  // Accounts created through a provider (e.g. Google) have no password hash;
  // they must authenticate with that provider, never here.
  if (
    userHashedPassNotp[0].otp != null ||
    userHashedPassNotp[0].userPassword == null
  ) {
    return { status: false };
  } else {
    const comapareStatus = await hashVerify(
      userPassword,
      userHashedPassNotp[0].userPassword
    );
    if (comapareStatus) {
      return {
        status: true,
        userId: userHashedPassNotp[0].userId,
      };
    } else {
      return { status: false };
    }
  }
};
