CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."shipping_class" AS ENUM('standard', 'express', 'free', 'digital', 'heavy');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "authenticators" (
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_user_id_credential_id_pk" PRIMARY KEY("user_id","credential_id"),
	CONSTRAINT "authenticators_credentialID_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"parent_id" text,
	"featured" boolean DEFAULT false,
	"sort_order" numeric(10, 0) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"website" text,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"variant_id" text,
	"quantity" numeric(10, 0) NOT NULL,
	"type" text NOT NULL,
	"reference" text,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" numeric NOT NULL,
	"title" text,
	"content" text,
	"is_verified_purchase" boolean DEFAULT false,
	"helpful_count" numeric(10, 0) DEFAULT '0',
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"price" numeric,
	"inventory" numeric(10, 0) DEFAULT '0',
	"options" jsonb DEFAULT '{}'::jsonb,
	"images" jsonb DEFAULT '[]'::jsonb,
	"default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"sku" text NOT NULL,
	"barcode" text,
	"brand_id" text,
	"price" numeric NOT NULL,
	"cost_price" numeric,
	"discount_price" numeric,
	"discount_start" timestamp,
	"discount_end" timestamp,
	"inventory" numeric(10, 0) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(10, 0) DEFAULT '5',
	"sold_count" numeric(10, 0) DEFAULT '0' NOT NULL,
	"category_id" text,
	"vendor_id" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"rating" numeric DEFAULT '0',
	"review_count" numeric(10, 0) DEFAULT '0',
	"taxable" boolean DEFAULT true,
	"tax_class" text DEFAULT 'standard',
	"weight" numeric,
	"dimensions" jsonb DEFAULT '{"length":0,"width":0,"height":0}'::jsonb,
	"shipping_class" text DEFAULT 'standard',
	"visibility" boolean DEFAULT true NOT NULL,
	"is_digital" boolean DEFAULT false NOT NULL,
	"file_url" text,
	"labels" jsonb DEFAULT '[]'::jsonb,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "related_products" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"related_product_id" text NOT NULL,
	"type" text NOT NULL,
	"sort_order" numeric(10, 0) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"email" text NOT NULL,
	"phone" text,
	"address" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"commission_rate" numeric DEFAULT '10',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_slug_unique" UNIQUE("slug")
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" text NOT NULL,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "category_featured_idx" ON "categories" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "brand_slug_idx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "brand_featured_idx" ON "brands" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "inventory_tx_product_idx" ON "inventory_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_tx_variant_idx" ON "inventory_transactions" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "inventory_tx_type_idx" ON "inventory_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_review_product_idx" ON "product_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_review_user_idx" ON "product_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_review_status_idx" ON "product_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_variant_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "vendor_idx" ON "products" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "featured_idx" ON "products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "visibility_idx" ON "products" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "related_product_idx" ON "related_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "related_related_idx" ON "related_products" USING btree ("related_product_id");--> statement-breakpoint
CREATE INDEX "related_unique_idx" ON "related_products" USING btree ("product_id","related_product_id");--> statement-breakpoint
CREATE INDEX "vendor_slug_idx" ON "vendors" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vendor_status_idx" ON "vendors" USING btree ("status");