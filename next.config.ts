import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "openai", "@prisma/adapter-pg"],
};

export default nextConfig;
