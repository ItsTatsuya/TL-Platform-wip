import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { useTypeScriptCli: false, cpus: 1 },
};

export default nextConfig;
