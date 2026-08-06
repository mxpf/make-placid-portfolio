import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(md|ya?ml)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
