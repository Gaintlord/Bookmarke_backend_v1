ALTER TABLE "bokmarkeTable" DROP CONSTRAINT "bokmarkeTable_pageLink_unique";--> statement-breakpoint
ALTER TABLE "refreshTokens" ALTER COLUMN "tokenHash" SET DATA TYPE varchar(64);--> statement-breakpoint
CREATE INDEX "by_hashed_token" ON "refreshTokens" USING btree ("tokenHash");