import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Agent / tunnel hosts so Chrome can call the dev server and Server Actions.
  allowedDevOrigins: ["**.agent.cvm.dev", "**.cvm.dev", "127.0.0.1"],
  experimental: {
    serverActions: {
      allowedOrigins: ["**.agent.cvm.dev", "**.cvm.dev", "localhost:3000"],
    },
  },
  serverExternalPackages: ["pg", "openai", "@prisma/adapter-pg"],
};

export default nextConfig;
