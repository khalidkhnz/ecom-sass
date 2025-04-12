import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { PT_Sans } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Khalidkhnz Store",
  description: "Khalidkhnz Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${nunito.variable} ${ptSans.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
