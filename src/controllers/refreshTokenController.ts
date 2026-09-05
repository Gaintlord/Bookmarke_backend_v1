import { eq } from "drizzle-orm";
import { refreshTokenTable } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { HashFunction, hashWCrypto } from "../utils/hashingUtil";
import {
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
} from "../utils/tokenManager";
import { refreshTokenExp } from "../utils/expirationManager";

export const refreshTokenRotation = async (
  oldRefToken: string,
  userIp: string,
  userAgent: string
) => {
  let userObj = await decodeRefreshToken(oldRefToken);
  console.log(userObj);

  //@ts-ignore
  const hashedOldToken = await hashWCrypto(userObj.jwtUid);

  const { refreshToken, jwtUid } = await createRefreshToken(
    // @ts-ignore
    userObj.email,
    // @ts-ignore
    userObj.userId
  );
  const newHashToken = await hashWCrypto(jwtUid);
  // @ts-ignore
  const userID = parseInt(userObj.userId);
  console.log(`!!!!!!!!!! BEFORE TRANSACTION !!!!!!!!!!`);
  console.log(hashedOldToken);

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(refreshTokenTable)
        .set({ revoked: true })
        .where(eq(refreshTokenTable.tokenHash, hashedOldToken));

      const response = await tx.insert(refreshTokenTable).values({
        userId: userID,
        tokenHash: newHashToken,
        userAgent: userAgent,
        ipAddress: userIp,
        expiresAt: new Date(Date.now() + refreshTokenExp),
      });
    });
  } catch (err) {
    console.log(`#######!!!!!!!!!! ${err} !!!!!!!!!! #######`);
  }
  console.log(`!!!!!!!!!! AFTER TRANSACTION !!!!!!!!!!`);

  // @ts-ignore
  const newAccessToken = await createAccessToken(userObj.email, userObj.userId);
  let newRefToken = refreshToken;
  return { newAccessToken, newRefToken };
};
