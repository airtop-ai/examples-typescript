"use client";

import { InitializeView } from "@/components/views/InitializeView";
import { ResultsView } from "@/components/views/ResultsView";
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
  const appStatus = useAppStore((state) => state.status);
  const sessionContext = useAppStore((state) => state.sessionContext);
  const sessionId = sessionContext?.session.id;

  useEffect(() => {
    // Set the API key from the cookie if it's not already set
    if (!apiKey && currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, [currentApiKey, apiKey, setApiKey]);

  // Hook to handle session termination when needed
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId,
  });

  // Effect to clean up sessions when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only terminate if we have an active session (sessionId + apiKey)
      if (sessionId && apiKey && appStatus !== "in_progress") {
        terminateSession();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, sessionId, appStatus, terminateSession]);

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

  // Conditional rendering based on application state:

  // 1. Show Live View as soon as we have a live view URL
  if (appStatus === "in_progress" && sessionContext?.windowInfo.liveViewUrl) {
    return <ShowLiveView liveViewUrl={sessionContext.windowInfo.liveViewUrl} />;
  }

  // 2. Show results if the task is completed
  if (appStatus === "completed") {
    return <ResultsView />;
  }

  // 3. Default view - show initialization screen
  return <InitializeView />;
}
