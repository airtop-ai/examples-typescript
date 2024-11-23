import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import "./globals.css";
import { exampleListings } from "@internal/home-config";
import { Body } from "@local/ui";
import { getApiKeyFromCookie, serverEnvs } from "@local/utils";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = exampleListings.YC_BATCH_COMPANY_EMPLOYEES.metadata;
const exampleDirName = exampleListings.YC_BATCH_COMPANY_EMPLOYEES.dirName;

export default async function RootLayout({ children }: PropsWithChildren) {
  const currentApiKey = await getApiKeyFromCookie();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <Body
        currentApiKey={currentApiKey}
        exampleDirName={exampleDirName}
        apiKeyBarProps={{
          airtopPortalUrl: serverEnvs.airtopPortalUrl,
          canRequestNewKey: serverEnvs.enableGetApiKeyFromPortal,
        }}
      >
        {children}
      </Body>
    </html>
  );
}
