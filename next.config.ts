import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Served from the custom domain (mdeesha.in) root — GitHub Pages drops the
  // /<repo-name>/ prefix once a custom domain is attached, so no basePath here.
};

export default nextConfig;
