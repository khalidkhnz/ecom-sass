import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@tanstack/react-query-devtools"],
  webpack: (config, { isServer }) => {
    // Fix for @tanstack/react-query-devtools
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Exclude problematic node modules from client bundle
      config.externals = [...(config.externals || []), "@mapbox/node-pre-gyp"];
    }
    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "*",
      "www.thevaluestore.in",
      "placehold.co",
      "rukminim2.flixcart.com",
    ],
  },
};

export default nextConfig;
