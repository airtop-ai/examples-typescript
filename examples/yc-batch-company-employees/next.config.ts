import {exampleListings, getHeadersConfig, registerToHome} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...getHeadersConfig(),
  ...registerToHome(exampleListings.YC_BATCH_COMPANY_EMPLOYEES.dirName),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
