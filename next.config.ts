import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trimage.rhaon.co.kr",
      },
    ],
  },
};

export default nextConfig;
