import { sql } from "drizzle-orm";
import { bokmarkeTable } from "../models/dbSchemas";
import { db } from "../utils/dataBaseUtil";
import { getDomainColor } from "../utils/domainColor";

type DashboardGroup = {
  website: string;
  totalBookmarks: number;
  latestDate: string;
  latestImageLinks: string[];
  color: string;
};

export const getBookmarkDashboard = async (userId: number) => {
  // Rank before aggregation so PostgreSQL returns only the latest three images
  // for each website while still counting every bookmark in that group.
  const result = await db.execute(sql`
    WITH ranked_bookmarks AS (
      SELECT
        ${bokmarkeTable.hostName} AS website,
        ${bokmarkeTable.imageLink} AS image_url,
        ${bokmarkeTable.reAddedAt} AS saved_at,
        COUNT(*) OVER (PARTITION BY ${bokmarkeTable.hostName}) AS total_bookmarks,
        ROW_NUMBER() OVER (
          PARTITION BY ${bokmarkeTable.hostName}
          ORDER BY ${bokmarkeTable.reAddedAt} DESC, ${bokmarkeTable.bokmarkeId} DESC
        ) AS bookmark_rank
      FROM ${bokmarkeTable}
      WHERE ${bokmarkeTable.userId} = ${userId}
    )
    SELECT
      website,
      MAX(total_bookmarks)::integer AS "totalBookmarks",
      MAX(saved_at)::timestamp AS "latestDate",
      COALESCE(
        json_agg(image_url ORDER BY bookmark_rank)
          FILTER (WHERE bookmark_rank <= 3),
        '[]'::json
      ) AS "latestImageLinks"
    FROM ranked_bookmarks
    GROUP BY website
    ORDER BY MAX(saved_at) DESC, website ASC
  `);

  return (result.rows as Omit<DashboardGroup, "color">[]).map((row) => ({
    ...row,
    color: getDomainColor(row.website),
  }));
};
