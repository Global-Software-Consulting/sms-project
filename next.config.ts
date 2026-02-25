import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double API calls in development
  // Note: In production, this doesn't matter as Strict Mode only affects dev
  reactStrictMode: false,
};

export default nextConfig;
