import {exampleListings, getHeadersConfig, getHomeConfig} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...getHeadersConfig(),
  async rewrites() {
    const rewrites = [];

    for (const example of Object.values(exampleListings)) {
      rewrites.push(...getHomeConfig(example.dirName));
    }

    return rewrites;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
