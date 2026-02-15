import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tanstack/react-query-devtools"],
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty.ts" },
      net: { browser: "./empty.ts" },
      tls: { browser: "./empty.ts" },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thevaluestore.in",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "rukminim2.flixcart.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
