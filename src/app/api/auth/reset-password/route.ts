import { db } from "@/db/index";
import { verification, user } from "@/db/schema/auth-schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, callbackUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user by email
    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!foundUser) {
      // Don't reveal if email exists for security
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generate reset token
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store verification token
    await db.insert(verification).values({
      id: nanoid(),
      identifier: email,
      value: token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email with reset link
    await sendPasswordResetEmail(
      email,
      token,
      `${
        callbackUrl ||
        process.env.BETTER_AUTH_URL ||
        "http://localhost:3000/reset-password"
      }`,
      foundUser.name
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
