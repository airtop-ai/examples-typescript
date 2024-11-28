import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import "./globals.css";
import { exampleListings } from "@internal/home-config";
import { Body } from "@local/ui";
import { getApiKeyFromCookie, serverEnvs } from "@local/utils";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = exampleListings.SIMPLE_INTERACTIONS.metadata;
const exampleDirName = exampleListings.SIMPLE_INTERACTIONS.dirName;

export default async function RootLayout({ children }: PropsWithChildren) {
  const nextCookies = await cookies();
  const currentApiKey = await getApiKeyFromCookie(nextCookies);

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
