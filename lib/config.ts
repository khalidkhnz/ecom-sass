import "dotenv/config";

export const config = {
  DB_URL:
    process.env.DB_URL || "postgresql://khalid:khalid@localhost:5433/test",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  NEXT_PUBLIC_UPLOAD_BASE_URL: process.env.NEXT_PUBLIC_UPLOAD_BASE_URL!,
};
