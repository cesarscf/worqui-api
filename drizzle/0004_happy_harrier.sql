ALTER TABLE "professionals" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_phone_unique" UNIQUE("phone");