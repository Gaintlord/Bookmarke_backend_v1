import { index } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, integer, varchar, boolean } from "drizzle-orm/pg-core";

export const userTableDB = pgTable("users", {
  userId: integer().primaryKey().generatedAlwaysAsIdentity().primaryKey(),
  userName: varchar({ length: 128 }),
  userEmail: varchar({ length: 255 }).notNull().unique(),
  userPassword: varchar({ length: 255 }).notNull(),
  otp: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});

export const refreshTokenTable = pgTable(
  "refreshTokens",
  {
    Tokenid: integer().generatedAlwaysAsIdentity().primaryKey(),
    userId: integer()
      .references(() => userTableDB.userId, { onDelete: "cascade" })
      .notNull(),
    tokenHash: varchar({ length: 64 }).notNull(),
    userAgent: varchar({ length: 255 }),
    ipAddress: varchar({ length: 64 }),
    expiresAt: timestamp().notNull(),
    revoked: boolean().default(false).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [index("by_hashed_token").on(table.tokenHash)]
);

export const bokmarkeTable = pgTable(
  "bokmarkeTable",
  {
    bokmarkeId: integer().generatedAlwaysAsIdentity().primaryKey(),
    userId: integer()
      .references(() => userTableDB.userId, { onDelete: "cascade" })
      .notNull(),
    pageLink: varchar({ length: 1024 }).notNull(),
    imageLink: varchar({ length: 1024 }).notNull(),
    hostName: varchar({ length: 256 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    reAddedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("by_host_name").on(table.hostName),
    index("by_userId").on(table.userId),
    index("bookmark_dashboard_lookup_idx").on(
      table.userId,
      table.hostName,
      table.reAddedAt.desc(),
      table.bokmarkeId.desc()
    ),
  ]
);

export const domainColor = pgTable(
  "domainColor",
  {
    domaineName: varchar({ length: 256 }),
    domainTheme: varchar({ length: 64 }),
  },
  (table) => [index("domainName_color").on(table.domaineName)]
);
