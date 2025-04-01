import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// This script seeds the database with sample data
async function main() {
  console.log("Seeding database...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle({ client: pool, schema });

  try {
    // Insert sample users
    console.log("Adding sample users...");
    await db.insert(schema.users).values([
      {
        name: "Admin User",
        email: "admin@example.com",
        password:
          "$2a$10$6KanVMVe1vR/wZvs.IRkLerdDLlB9l0Z1J17HBBK8YZnUCT.Yyaei", // hashed "password123"
        role: "admin",
      },
      {
        name: "Regular User",
        email: "user@example.com",
        password:
          "$2a$10$6KanVMVe1vR/wZvs.IRkLerdDLlB9l0Z1J17HBBK8YZnUCT.Yyaei", // hashed "password123"
        role: "user",
      },
    ]);

    // Insert sample products
    console.log("Adding sample products...");
    await db.insert(schema.products).values([
      {
        name: "Premium Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: "129.99",
        imageUrl: "https://example.com/headphones.jpg",
        stock: 50,
        createdById: 1, // Admin user
      },
      {
        name: "Smartphone Stand",
        description: "Adjustable aluminum stand for smartphones and tablets",
        price: "24.99",
        imageUrl: "https://example.com/stand.jpg",
        stock: 100,
        createdById: 1, // Admin user
      },
      {
        name: "Wireless Charger",
        description:
          "Fast wireless charging pad compatible with all Qi devices",
        price: "39.99",
        imageUrl: "https://example.com/charger.jpg",
        stock: 75,
        createdById: 1, // Admin user
      },
    ]);

    // Insert sample order
    console.log("Adding sample order...");
    await db.insert(schema.orders).values({
      userId: 2, // Regular user
      status: "completed",
      total: "154.98",
      shippingAddress: "123 Main St, City, Country",
      billingAddress: "123 Main St, City, Country",
      paymentMethod: "credit_card",
      paymentStatus: "paid",
    });

    // Insert sample order items
    console.log("Adding sample order items...");
    await db.insert(schema.orderItems).values([
      {
        orderId: 1,
        productId: 1,
        quantity: 1,
        priceAtPurchase: "129.99",
      },
      {
        orderId: 1,
        productId: 2,
        quantity: 1,
        priceAtPurchase: "24.99",
      },
    ]);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    // Close the pool connection
    await pool.end();
  }
}

// Run the seed function
main().catch((err) => {
  console.error("Seeding failed!");
  console.error(err);
  process.exit(1);
});
