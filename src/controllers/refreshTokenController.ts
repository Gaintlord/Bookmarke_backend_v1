import { and, eq, gt } from "drizzle-orm";
import { refreshTokenTable } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { hashWCrypto } from "../utils/hashingUtil";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenManager";
import { refreshTokenExp } from "../utils/expirationManager";

export class RefreshTokenRejectedError extends Error {}

export const refreshTokenRotation = async (
  oldRefToken: string,
  userIp: string,
  userAgent: string
) => {
  // jwt.verify checks the signature and expiry before any claims are trusted.
  const userObj = await verifyRefreshToken(oldRefToken);
  const userId = Number(userObj.userId);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new RefreshTokenRejectedError("Invalid refresh-token subject");
  }

  const hashedOldToken = await hashWCrypto(userObj.jwtUid);

  const { refreshToken, jwtUid } = await createRefreshToken(
    userObj.email,
    userObj.userId
  );
  const newHashToken = await hashWCrypto(jwtUid);

  await db.transaction(async (tx) => {
      // The conditional update makes refresh-token use single-use, including
      // when two refresh requests arrive at nearly the same time.
      const revokedToken = await tx
        .update(refreshTokenTable)
        .set({ revoked: true })
        .where(
          and(
            eq(refreshTokenTable.tokenHash, hashedOldToken),
            eq(refreshTokenTable.userId, userId),
            eq(refreshTokenTable.revoked, false),
            gt(refreshTokenTable.expiresAt, new Date())
          )
        )
        .returning({ tokenId: refreshTokenTable.Tokenid });

      if (revokedToken.length !== 1) {
        throw new RefreshTokenRejectedError("Refresh token is revoked or unknown");
      }

      await tx.insert(refreshTokenTable).values({
        userId,
        tokenHash: newHashToken,
        userAgent,
        ipAddress: userIp,
        expiresAt: new Date(Date.now() + refreshTokenExp),
      });
  });

  const newAccessToken = await createAccessToken(userObj.email, userObj.userId);
  return { newAccessToken, newRefToken: refreshToken };
};

export const revokeRefreshToken = async (oldRefToken: string) => {
  const userObj = await verifyRefreshToken(oldRefToken);
  const userId = Number(userObj.userId);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new RefreshTokenRejectedError("Invalid refresh-token subject");
  }

  const hashedOldToken = await hashWCrypto(userObj.jwtUid);

  await db
    .update(refreshTokenTable)
    .set({ revoked: true })
    .where(
      and(
        eq(refreshTokenTable.tokenHash, hashedOldToken),
        eq(refreshTokenTable.userId, userId),
        eq(refreshTokenTable.revoked, false)
      )
    );
};
