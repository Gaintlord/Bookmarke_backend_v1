UPDATE "bokmarkeTable"
SET "reAddedAt" = "createdAt"
WHERE "reAddedAt" IS NULL;--> statement-breakpoint
ALTER TABLE "bokmarkeTable" ALTER COLUMN "reAddedAt" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "bookmark_dashboard_lookup_idx" ON "bokmarkeTable" USING btree ("userId","hostName","reAddedAt" DESC NULLS LAST,"bokmarkeId" DESC NULLS LAST);
