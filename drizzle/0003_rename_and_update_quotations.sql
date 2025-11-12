ALTER TABLE "requests" RENAME TO "service_orders";--> statement-breakpoint
ALTER TABLE "quotations" ALTER COLUMN "price" TYPE integer USING "price"::integer;--> statement-breakpoint
ALTER TABLE "quotations" RENAME COLUMN "price" TO "price_in_cents";
