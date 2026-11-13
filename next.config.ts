import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf", "pdf-parse"],
  turbopack: {},
};

export default nextConfig;
