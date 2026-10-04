ALTER TABLE "users" ALTER COLUMN "userPassword" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "googleId" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "authProvider" varchar(32) DEFAULT 'password' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_googleId_unique" UNIQUE("googleId");