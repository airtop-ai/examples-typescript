import { exampleListings, registerToHome} from "@internal/home-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...registerToHome(exampleListings.LINKEDIN_DATA_EXTRACTION.dirName),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
