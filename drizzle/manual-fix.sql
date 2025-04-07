-- Drop table if it exists to recreate it with proper constraints
DROP TABLE IF EXISTS "wishlist_items";

-- Create wishlist_items table with proper column names and constraints
CREATE TABLE IF NOT EXISTS "wishlist_items" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
);

-- Create index manually instead of using COALESCE in the constraint
CREATE UNIQUE INDEX "user_product_variant_idx" ON "wishlist_items" ("user_id", "product_id", COALESCE("variant_id", '')); 