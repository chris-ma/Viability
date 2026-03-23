import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile packages that need it
  transpilePackages: ["recharts"],
  // Images config
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.clerk.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
    ],
  },
};

export default nextConfig;
