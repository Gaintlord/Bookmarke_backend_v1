import { and, desc, eq } from "drizzle-orm";
import { bokmarkeTable } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";

export const addUserBookmarkeToDb = async (
  image: string,
  link: string,
  hostName: string,
  userId: number
) => {
  console.log(
    "!########## WE ARE HERE AT addingbookmarke to db #############!"
  );
  try {
    await db.insert(bokmarkeTable).values({
      userId: userId,
      pageLink: link,
      imageLink: image,
      hostName: hostName,
    });
  } catch (err) {
    console.log("!#######################!");
    console.log(err);
    console.log("!#######################!");
    const timeNow = new Date();
    // @ts-ignore
    if (err.cause.code === "23505") {
      try {
        await db
          .update(bokmarkeTable)
          .set({ reAddedAt: timeNow })
          .where(eq(bokmarkeTable.pageLink, link));
      } catch (err) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!");
        console.log(err);
        console.log("!!!!!!!!!!!!!!!!!!!!!!");
      }
    } else {
      console.log(`error for user ${userId} at ${new Date()} :\n\n`, err);
    }
  }
};

export const getUserBookmarksByDomain = async (
  userId: number,
  hostName: string
) => {
  return db
    .select({
      image: bokmarkeTable.imageLink,
      link: bokmarkeTable.pageLink,
      addedAtDate: bokmarkeTable.reAddedAt,
    })
    .from(bokmarkeTable)
    .where(
      and(
        eq(bokmarkeTable.userId, userId),
        eq(bokmarkeTable.hostName, hostName)
      )
    )
    .orderBy(desc(bokmarkeTable.reAddedAt), desc(bokmarkeTable.bokmarkeId));
};
