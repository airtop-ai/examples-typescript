"use client";
// import { DisplayPromptResponse } from "@/components/views/DisplayPromptResponse";
import { InitializeView } from "@/components/views/InitializeView";
import { ShowLiveView } from "@/components/views/ShowLiveView";
import { useAppStore } from "@/store";
import { ApiKeyRequired, useTerminateSession, useToast } from "@local/ui";
import { useEffect } from "react";

interface MainContentProps {
  currentApiKey?: string;
}

export function MainContent({ currentApiKey }: MainContentProps) {
  // Get API key and response from global state
  const setApiKey = useAppStore((state) => state.setApiKey);
  const apiKey = useAppStore((state) => state.apiKey);
  const session = useAppStore((state) => state.session);
  const taskFulfillment = useAppStore((state) => state.taskFulfillment);
  const { toast } = useToast();

  useEffect(() => {
    // Set the API key from the cookie if it's not already set
    if (!apiKey && currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, [currentApiKey, apiKey, setApiKey]);

  // Hook to handle session termination when needed
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId: session.sessionId,
  });

  // Effect to clean up sessions when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only terminate if we have an active session (sessionId + apiKey)
      if (session.sessionId && apiKey && !taskFulfillment?.accomplished) {
        terminateSession();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [apiKey, session.sessionId, taskFulfillment.accomplished, terminateSession]);

  // Toast when user has to sign-in
  useEffect(() => {
    if (session.signInRequired) {
      toast({
        title: "Sign-in to Facebook",
        description: `After you sign-in click on "I've signed in" to continue`,
      });
    }
  }, [toast, session.signInRequired]);

  // Toast when agent finished task successfully
  useEffect(() => {
    if (taskFulfillment.accomplished) {
      toast({
        title: "🎉🎊 Yay!",
        description: "Your agent has successfully replied to your customer",
        duration: Number.POSITIVE_INFINITY,
      });
      setTimeout(terminateSession, 5 * 1000);
    }
  }, [terminateSession, toast, taskFulfillment.accomplished]);

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

  // Show live view when session has started
  if (session?.liveViewUrl) {
    return <ShowLiveView />;
  }

  // Default view
  return <InitializeView />;
}
