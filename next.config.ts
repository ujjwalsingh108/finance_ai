import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kowxpazskkigzwdwzwyq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
