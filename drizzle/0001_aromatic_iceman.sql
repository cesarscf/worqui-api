DROP TABLE IF EXISTS "service_addresses" CASCADE;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "postal_code" varchar(10) NOT NULL;