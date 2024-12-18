import { tailwindConfig } from "@local/tailwind-config";
import type { Config } from "tailwindcss";

export default {
  ...tailwindConfig,
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@local/ui/dist/**/*.{js,ts,jsx,tsx,mdx}"
  ]
} satisfies Config;
