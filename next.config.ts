import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL?.replace(/\/+$/, "");

if (!backendUrl) {
  throw new Error(
    "BACKEND_URL is missing. Add it to .env.local.",
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;