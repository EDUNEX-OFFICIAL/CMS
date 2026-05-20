import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// Monorepo: single root .env.local for API + web (NEXT_PUBLIC_*)
loadEnv({ path: path.join(repoRoot, ".env.local") });
loadEnv({ path: path.join(repoRoot, ".env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/shared"],
};

export default nextConfig;