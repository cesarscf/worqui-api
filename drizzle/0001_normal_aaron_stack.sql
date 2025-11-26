CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'accepted', 'rejected', 'counter_offer');--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."proposal_status";--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DATA TYPE "public"."proposal_status" USING "status"::"public"."proposal_status";