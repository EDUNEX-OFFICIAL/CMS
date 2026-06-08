import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/shared"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
