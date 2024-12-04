"use client";
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
  const resetResponse = useAppStore((state) => state.resetResponse);

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
      // Only terminate if we have an active session (sessionId + apiKey)
      // but no content yet (still processing)
      if (apiResponse.sessionId && apiKey && !apiResponse.content) {
        terminateSession();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, apiResponse.sessionId, apiResponse.content, terminateSession]);

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

  // Conditional rendering based on application state:

  // 1. Show Live View as soon as we have a live view URL
  if (!apiResponse.content && apiResponse?.liveViewUrl) {
    return <ShowLiveView liveViewUrl={apiResponse.liveViewUrl} />;
  }

  // 2. Show results if we have content
  if (apiResponse.content) {
    return <DisplayPromptResponse content={apiResponse.content} tryAgain={resetResponse} />;
  }

  // 3. Default view - show initialization screen
  return <InitializeView />;
}
