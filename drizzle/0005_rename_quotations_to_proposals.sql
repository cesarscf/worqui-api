-- Rename quotation_status enum to proposal_status
ALTER TYPE "public"."quotation_status" RENAME TO "proposal_status";--> statement-breakpoint

-- Rename quotations table to proposals
ALTER TABLE "quotations" RENAME TO "proposals";
