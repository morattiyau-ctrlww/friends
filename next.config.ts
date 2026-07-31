import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/friends",
  images: { unoptimized: true },
};

export default nextConfig;
