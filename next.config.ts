import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/eeshaPortfolio",
  assetPrefix: "/eeshaPortfolio/",
};

export default nextConfig;
