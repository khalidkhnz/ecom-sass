import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function GET() {
  try {
    // Simple query to test the database connection
    const allProducts = await db.select().from(products).limit(10);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: allProducts,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
