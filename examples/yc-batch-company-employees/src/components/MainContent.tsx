"use client";
import { BatchSelectorForm } from "@/components/forms/BatchSelectionForm";
import { DisplayPromptResponse } from "@/components/views/DisplayPromptResponse";
import { InitializeView } from "@/components/views/InitializeView";
import { ShowLiveView } from "@/components/views/ShowLiveView";
import { useAppStore } from "@/store";
import { ApiKeyRequired, useTerminateSession } from "@local/ui";
import { useEffect } from "react";

interface MainContentProps {
  currentApiKey?: string;
}

export function MainContent({ currentApiKey }: MainContentProps) {
  // Get API key and response from global state
  const setApiKey = useAppStore((state) => state.setApiKey);
  const apiKey = useAppStore((state) => state.apiKey);
  const apiResponse = useAppStore((state) => state.response);
  const batches = useAppStore((state) => state.batches);

  useEffect(() => {
    // Set the API key from the cookie if it's not already set
    if (!apiKey && currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, [currentApiKey, apiKey, setApiKey]);

  // Hook to handle session termination when needed
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId: apiResponse.sessionId,
  });

  // Effect to clean up sessions when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (apiResponse.sessionId && apiKey && !apiResponse.content) {
        terminateSession();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, apiResponse.sessionId, apiResponse.content, terminateSession]);

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

  // Conditional rendering based on application state:

  // 1. Show LinkedIn authentication view if sign-in is required
  if (apiResponse?.signInRequired && apiResponse?.liveViewUrl) {
    return <ShowLiveView liveViewUrl={apiResponse.liveViewUrl} />;
  }

  // 2. Show results if we have content
  if (apiResponse.content) {
    return <DisplayPromptResponse content={apiResponse.content} profileId={apiResponse.profileId} />;
  }

  // 3. Show batch selection if we have batches but no selection
  if (batches && batches.length > 0) {
    return <BatchSelectorForm batches={batches} />;
  }

  // 4. Default view - show initialization screen
  return <InitializeView />;
}
