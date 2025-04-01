import { db } from "@/db/index";
import { account, verification } from "@/db/schema/auth-schema";
import { and, eq, gt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find verification token that matches and hasn't expired
    const verificationToken = await db.query.verification.findFirst({
      where: and(
        eq(verification.value, token),
        gt(verification.expiresAt, new Date())
      ),
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find account by email identifier
    const userAccount = await db.query.account.findFirst({
      where: and(eq(account.providerId, "credentials")),
      with: {
        user: true,
      },
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Update password in account
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    // Delete the verification token
    await db
      .delete(verification)
      .where(eq(verification.id, verificationToken.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
