import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Agent / tunnel hosts so Chrome can call the dev server and Server Actions.
  allowedDevOrigins: [
    "**.agent.cvm.dev",
    "**.cvm.dev",
    "**.cursorvm.com",
    "127.0.0.1",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: [
        "**.agent.cvm.dev",
        "**.cvm.dev",
        "**.cursorvm.com",
        "localhost:3000",
      ],
    },
  },
  async headers() {
    return [
      {
        source: "/app/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "Vary", value: "Cookie" },
        ],
      },
    ];
  },
  serverExternalPackages: ["pg", "openai", "@prisma/adapter-pg"],
};

export default nextConfig;
