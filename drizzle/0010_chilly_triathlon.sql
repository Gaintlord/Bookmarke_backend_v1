CREATE TABLE "domainColor" (
	"domaineName" varchar(256),
	"domainTheme" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "bokmarkeTable" ALTER COLUMN "hostName" SET DATA TYPE varchar(256);--> statement-breakpoint
CREATE INDEX "domainName_color" ON "domainColor" USING btree ("domaineName");--> statement-breakpoint
CREATE INDEX "by_userId" ON "bokmarkeTable" USING btree ("userId");