CREATE TYPE "public"."quotation_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."service_order_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"postal_code" varchar(10) NOT NULL,
	"status" "service_order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "requests" CASCADE;--> statement-breakpoint
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_request_id_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "quotations" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."quotation_status";--> statement-breakpoint
ALTER TABLE "quotations" ALTER COLUMN "status" SET DATA TYPE "public"."quotation_status" USING "status"::"public"."quotation_status";--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "price_in_cents" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_request_id_service_orders_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."service_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" DROP COLUMN "price";