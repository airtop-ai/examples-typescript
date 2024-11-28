"use client";

import { ApiKeyForm } from "@/components/blocks/api-key/ApiKeyForm.jsx";
import { useHandleError } from "@/hooks/index.js";
import { useCallback } from "react";

export interface ApiKeyBarProps {
  /**
   * If set, the current API key that is being used.
   */
  currentApiKey?: string;
  /**
   * If true, shows a UI to request a new API key directly from the Airtop portal.
   * If false, the user must enter an API key manually.
   */
  canRequestNewKey?: boolean;
  /**
   * The URL of the Airtop portal.
   */
  airtopPortalUrl?: string;
  /**
   * The directory name of the example site we'll be redirecting to
   * after an API key is generated.
   */
  exampleDirName?: string;
}

export function ApiKeyBar({ currentApiKey, canRequestNewKey, airtopPortalUrl, exampleDirName }: ApiKeyBarProps) {
  const handleError = useHandleError();

  const handleOnApiKeySet = useCallback(() => {
    location.reload();
  }, []);

  const handleGetApiKey = useCallback(() => {
    if (canRequestNewKey) {
      window.location.href = `${airtopPortalUrl}/api-keys/generate-for-example?site=${exampleDirName}`;
    } else {
      window.open("https://portal.airtop.ai/api-keys", "_blank", "noopener,noreferrer");
    }
  }, [airtopPortalUrl, exampleDirName, canRequestNewKey]);

  const handleOnError = useCallback(
    (error: any) => {
      handleError({
        error,
        consoleLogMessage: "Error modifying API key",
        toastTitle: "Error modifying API key",
      });
    },
    [handleError],
  );

  return (
    <div className="mt-6">
      <ApiKeyForm
        onError={handleOnError}
        onSuccess={handleOnApiKeySet}
        currentApiKey={currentApiKey}
        onRequestNewKey={handleGetApiKey}
      />
    </div>
  );
}
