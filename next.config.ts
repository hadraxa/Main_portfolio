import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal server.js and trace its runtime dependencies for Docker.
  output: "standalone",
};

export default nextConfig;
