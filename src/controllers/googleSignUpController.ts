import { eq } from "drizzle-orm";
import { userTableDB } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";

export type GoogleProfile = {
  email: string;
  googleId: string;
  name?: string | null;
};

const linkGoogleId = async (userId: number, googleId: string) => {
  // Linking an existing account only records the Google identity and clears any
  // pending OTP: a Google-verified email already proves ownership of the
  // address. authProvider is left untouched so a password account keeps working.
  await db
    .update(userTableDB)
    .set({ googleId, otp: null, updatedAt: new Date(Date.now()) })
    .where(eq(userTableDB.userId, userId));
};

export const findOrCreateGoogleUser = async (
  profile: GoogleProfile
): Promise<{ userId: number; email: string }> => {
  const existing = await db
    .select({
      userId: userTableDB.userId,
      googleId: userTableDB.googleId,
    })
    .from(userTableDB)
    .where(eq(userTableDB.userEmail, profile.email));

  if (existing.length > 0) {
    const user = existing[0];
    if (user.googleId == null) {
      await linkGoogleId(user.userId, profile.googleId);
    }
    return { userId: user.userId, email: profile.email };
  }

  const inserted = await db
    .insert(userTableDB)
    .values({
      userEmail: profile.email,
      userName: profile.name ?? null,
      userPassword: null,
      googleId: profile.googleId,
      authProvider: "google",
      otp: null,
      createdAt: new Date(Date.now()),
    })
    .onConflictDoNothing()
    .returning({ userId: userTableDB.userId });

  if (inserted.length > 0) {
    return { userId: inserted[0].userId, email: profile.email };
  }

  // Lost a race with a concurrent signup. Re-read the winner and link to it.
  const raced = await db
    .select({
      userId: userTableDB.userId,
      googleId: userTableDB.googleId,
    })
    .from(userTableDB)
    .where(eq(userTableDB.userEmail, profile.email));

  if (raced.length === 0) {
    throw new Error("Google user could not be created");
  }

  const user = raced[0];
  if (user.googleId == null) {
    await linkGoogleId(user.userId, profile.googleId);
  }
  return { userId: user.userId, email: profile.email };
};
