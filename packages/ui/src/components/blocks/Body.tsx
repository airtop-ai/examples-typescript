import { ApiKeyBar, type ApiKeyBarProps } from "@/components/index.js";
import { ThemeProvider } from "@/components/providers/ThemeProvider.jsx";
import { Toaster } from "@/components/ui/toaster.jsx";
import { fontMono, fontSans } from "@/lib/fonts.js";
import { cn } from "@/lib/index.js";
import type { PropsWithChildren } from "react";
import { HeaderNavigation } from "./HeaderNavigation.jsx";

interface BodyProps extends PropsWithChildren {
  exampleDirName?: string;
  currentApiKey?: string;
  /**
   * If defined, will render the API key bar
   */
  apiKeyBarProps?: Omit<ApiKeyBarProps, "currentApiKey" | "exampleDirName">;
}

export function Body({ children, exampleDirName, currentApiKey, apiKeyBarProps }: BodyProps) {
  return (
    <body
      className={cn("min-h-screen bg-background font-sans antialiased mx-12", fontSans.variable, fontMono.variable)}
    >
      <ThemeProvider>
        <HeaderNavigation exampleDirName={exampleDirName} />
        {apiKeyBarProps && (
          <ApiKeyBar {...apiKeyBarProps} currentApiKey={currentApiKey} exampleDirName={exampleDirName} />
        )}
        <div>
          <div className="relative flex min-h-screen flex-col bg-background">{children}</div>
        </div>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
