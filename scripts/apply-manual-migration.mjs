import pkg from "pg";
const { Client } = pkg;

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection string
const DB_URL =
  process.env.DB_URL || "postgresql://khalid:khalid@localhost:5433/test";

async function main() {
  // Create a new client
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    // Connect to the database
    console.log("Connecting to database...");
    await client.connect();

    // First, get the column types
    const checkResult = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name IN ('images', 'tags')
    `);

    for (const col of checkResult.rows) {
      console.log(
        `Column ${col.column_name} is type ${col.data_type} (${col.udt_name})`
      );
    }

    // Handle images column conversion
    console.log("Converting images column...");
    try {
      // First, add a temporary column
      await client.query(
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images_jsonb" JSONB DEFAULT '[]'`
      );

      // Update the temporary column with data from the original column
      await client.query(`
        UPDATE "products"
        SET "images_jsonb" = 
          CASE 
            WHEN "images" IS NULL THEN '[]'::jsonb
            ELSE to_jsonb("images")
          END
      `);

      // Drop the original column
      await client.query(`ALTER TABLE "products" DROP COLUMN "images"`);

      // Rename the temporary column to the original name
      await client.query(
        `ALTER TABLE "products" RENAME COLUMN "images_jsonb" TO "images"`
      );

      console.log("Successfully converted images column to JSONB");
    } catch (error) {
      console.error("Error converting images column:", error.message);
    }

    // Handle tags column conversion
    console.log("Converting tags column...");
    try {
      // First, add a temporary column
      await client.query(
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tags_jsonb" JSONB DEFAULT '[]'`
      );

      // Update the temporary column with data from the original column
      await client.query(`
        UPDATE "products"
        SET "tags_jsonb" = 
          CASE 
            WHEN "tags" IS NULL THEN '[]'::jsonb
            ELSE to_jsonb("tags")
          END
      `);

      // Drop the original column
      await client.query(`ALTER TABLE "products" DROP COLUMN "tags"`);

      // Rename the temporary column to the original name
      await client.query(
        `ALTER TABLE "products" RENAME COLUMN "tags_jsonb" TO "tags"`
      );

      console.log("Successfully converted tags column to JSONB");
    } catch (error) {
      console.error("Error converting tags column:", error.message);
    }

    // Create enum types
    console.log("Creating enum types...");
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
          CREATE TYPE "product_status" AS ENUM ('draft', 'active', 'archived');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_label') THEN
          CREATE TYPE "product_label" AS ENUM ('new', 'bestseller', 'featured', 'sale', 'limited');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipping_class') THEN
          CREATE TYPE "shipping_class" AS ENUM ('standard', 'express', 'free', 'digital', 'heavy');
        END IF;
      END $$;
    `);

    // Create brands table
    console.log("Creating brands table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "brands" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "logo" TEXT,
        "website" TEXT,
        "featured" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "brand_slug_idx" ON "brands" ("slug");
      CREATE INDEX IF NOT EXISTS "brand_featured_idx" ON "brands" ("featured");
    `);

    // Create vendors table
    console.log("Creating vendors table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "logo" TEXT,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "address" JSONB DEFAULT '{}',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "commissionRate" NUMERIC(5, 2) DEFAULT 10,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "vendor_slug_idx" ON "vendors" ("slug");
      CREATE INDEX IF NOT EXISTS "vendor_status_idx" ON "vendors" ("status");
    `);

    // Add new columns to products table
    console.log("Adding new columns to products table...");

    // Add each column individually
    const columns = [
      `"shortDescription" TEXT`,
      `"sku" TEXT`,
      `"barcode" TEXT`,
      `"brandId" TEXT REFERENCES "brands" ("id") ON DELETE SET NULL`,
      `"costPrice" NUMERIC(12, 4)`,
      `"discountPrice" NUMERIC(12, 4)`,
      `"discountStart" TIMESTAMP`,
      `"discountEnd" TIMESTAMP`,
      `"lowStockThreshold" NUMERIC(10, 0) DEFAULT 5`,
      `"soldCount" NUMERIC(10, 0) DEFAULT 0`,
      `"vendorId" TEXT REFERENCES "vendors" ("id") ON DELETE CASCADE`,
      `"attributes" JSONB DEFAULT '{}'`,
      `"rating" NUMERIC(3, 2) DEFAULT 0`,
      `"reviewCount" NUMERIC(10, 0) DEFAULT 0`,
      `"taxable" BOOLEAN DEFAULT true`,
      `"taxClass" TEXT DEFAULT 'standard'`,
      `"weight" NUMERIC(10, 2)`,
      `"dimensions" JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}'`,
      `"shippingClass" TEXT DEFAULT 'standard'`,
      `"visibility" BOOLEAN DEFAULT true`,
      `"isDigital" BOOLEAN DEFAULT false`,
      `"fileUrl" TEXT`,
      `"labels" JSONB DEFAULT '[]'`,
      `"metaTitle" TEXT`,
      `"metaDescription" TEXT`,
    ];

    for (const column of columns) {
      const columnName = column.split(" ")[0].replace(/"/g, "");
      console.log(`Adding column ${columnName}...`);
      try {
        await client.query(
          `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS ${column};`
        );
      } catch (error) {
        console.error(`Error adding column ${columnName}:`, error.message);
      }
    }

    // Add unique constraints
    console.log("Adding unique constraints...");
    try {
      await client.query(
        `ALTER TABLE "products" ADD CONSTRAINT IF NOT EXISTS "unique_product_sku" UNIQUE ("sku");`
      );
      await client.query(
        `ALTER TABLE "products" ADD CONSTRAINT IF NOT EXISTS "unique_product_barcode" UNIQUE ("barcode");`
      );
    } catch (error) {
      console.error("Error adding constraints:", error.message);
    }

    // Create product variants table
    console.log("Creating product variants table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "product_variants" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "sku" TEXT NOT NULL UNIQUE,
        "barcode" TEXT UNIQUE,
        "price" NUMERIC(12, 4),
        "inventory" NUMERIC(10, 0) DEFAULT 0,
        "options" JSONB DEFAULT '{}',
        "images" JSONB DEFAULT '[]',
        "default" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "product_variant_product_idx" ON "product_variants" ("productId");
      CREATE INDEX IF NOT EXISTS "product_variant_sku_idx" ON "product_variants" ("sku");
    `);

    // Create product reviews table
    console.log("Creating product reviews table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "product_reviews" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL,
        "rating" NUMERIC(3, 2) NOT NULL,
        "title" TEXT,
        "content" TEXT,
        "isVerifiedPurchase" BOOLEAN DEFAULT false,
        "helpfulCount" NUMERIC(10, 0) DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "product_review_product_idx" ON "product_reviews" ("productId");
      CREATE INDEX IF NOT EXISTS "product_review_user_idx" ON "product_reviews" ("userId");
      CREATE INDEX IF NOT EXISTS "product_review_status_idx" ON "product_reviews" ("status");
    `);

    // Create inventory transactions table
    console.log("Creating inventory transactions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "inventory_transactions" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
        "variantId" TEXT REFERENCES "product_variants" ("id") ON DELETE CASCADE,
        "quantity" NUMERIC(10, 0) NOT NULL,
        "type" TEXT NOT NULL,
        "reference" TEXT,
        "notes" TEXT,
        "createdBy" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "inventory_tx_product_idx" ON "inventory_transactions" ("productId");
      CREATE INDEX IF NOT EXISTS "inventory_tx_variant_idx" ON "inventory_transactions" ("variantId");
      CREATE INDEX IF NOT EXISTS "inventory_tx_type_idx" ON "inventory_transactions" ("type");
    `);

    // Create related products table
    console.log("Creating related products table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "related_products" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
        "relatedProductId" TEXT NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL,
        "sortOrder" NUMERIC(10, 0) DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS "related_product_idx" ON "related_products" ("productId");
      CREATE INDEX IF NOT EXISTS "related_related_idx" ON "related_products" ("relatedProductId");
      CREATE UNIQUE INDEX IF NOT EXISTS "related_unique_idx" ON "related_products" ("productId", "relatedProductId");
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
  }
}

main();
