CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" numeric NOT NULL,
	"inventory" integer DEFAULT 0 NOT NULL,
	"category_id" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"images" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" varchar(100),
	"site_url" varchar(255),
	"admin_email" varchar(255),
	"enable_notifications" boolean DEFAULT true,
	"enable_analytics" boolean DEFAULT true,
	"store_name" varchar(100),
	"store_description" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"currency" varchar(10) DEFAULT 'USD',
	"enable_guest_checkout" boolean DEFAULT true,
	"enable_automatic_tax" boolean DEFAULT false,
	"max_products_per_order" integer DEFAULT 10,
	"shipping_from" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
