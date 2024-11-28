import {exampleListings, getHeadersConfig, getHomeConfig} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...getHeadersConfig([
    {
      // Ensures that the CSRF cookie is always generated for the /decrypt-api-key route
      source: '/decrypt-api-key',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
  ]),
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
