import { refreshTokenTable } from "../models/dbSchemas";
import { createAccessToken, createRefreshToken } from "../utils/tokenManager";
import { db } from "../utils/dataBaseUtil";
import { refreshTokenExp } from "../utils/expirationManager";
import { HashFunction, hashWCrypto } from "../utils/hashingUtil";
export const createAndStoreTokens = async (
  email: string,
  id: number,
  userIp: string,
  userAgent: string
) => {
  const { refreshToken, jwtUid } = await createRefreshToken(
    email,
    id.toString()
  );
  const accessToken = await createAccessToken(email, id.toString());

  const hashedToken = await hashWCrypto(jwtUid);

  await db.insert(refreshTokenTable).values({
    userId: id,
    tokenHash: hashedToken,
    userAgent: userAgent,
    ipAddress: userIp,
    expiresAt: new Date(Date.now() + refreshTokenExp),
  });

  return { refreshToken, accessToken, refreshTokenExp };
};
