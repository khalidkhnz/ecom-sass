CREATE TYPE "public"."tax_type" AS ENUM('vat', 'gst', 'sales', 'service', 'custom');--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tax_rate" numeric(5, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tax_type" text DEFAULT 'vat';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tax_details" jsonb DEFAULT '{"name":"","description":"","includedInPrice":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;