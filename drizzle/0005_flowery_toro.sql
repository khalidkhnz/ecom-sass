ALTER TABLE "inventory_transactions" ALTER COLUMN "quantity" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "product_reviews" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "product_reviews" ALTER COLUMN "rating" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "price" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "price" SET DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "cost_price" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "cost_price" SET DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "discount_price" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "discount_price" SET DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "rating" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "weight" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "weight" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "dimensions" SET DEFAULT '{"length":"0.00","width":"0.00","height":"0.00"}'::jsonb;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "commission_rate" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "commission_rate" SET DEFAULT '10.00';