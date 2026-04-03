import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.fineartamerica.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i1.pickpik.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
