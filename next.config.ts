import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
