import {exampleListings, getHeadersConfig, registerToHome} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...getHeadersConfig(),
  ...registerToHome(exampleListings.SIMPLE_INTERACTIONS.dirName),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
