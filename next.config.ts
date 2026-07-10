import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "www.thebarberyasin.com",
      },
      {
        protocol: "https",
        hostname: "thebarberyasin.com",
      },
    ],
  },
};

export default nextConfig;
