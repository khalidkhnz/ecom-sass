ALTER TABLE "users" ADD COLUMN "payment_methods" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_settings" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_preferences" jsonb;