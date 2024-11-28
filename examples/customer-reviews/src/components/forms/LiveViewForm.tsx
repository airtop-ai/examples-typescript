import { useAppStore } from "@/store";
import { Button, useHandleError, useTerminateSession } from "@local/ui";
import { useCallback } from "react";
import { Spinner } from "./Spinner";

export function LiveViewForm() {
  // Store state management hooks for handling responses and API key
  const apiKey = useAppStore((state) => state.apiKey);
  const session = useAppStore((state) => state.session);
  const resetResponse = useAppStore((state) => state.resetResponse);
  const setFulfillmentResponse = useAppStore((state) => state.setFulfillmentResponse);
  const requestFulfillTask = useAppStore((state) => state.requestFulfillTask);
  const setFetching = useAppStore((state) => state.setFetching);
  const isFetching = useAppStore((state) => state.fetching);

  // Local state to manage form submission status
  const handleError = useHandleError();

  // Hook to handle session termination
  const onTerminateSession = useTerminateSession({
    sessionId: session.sessionId!,
    apiKey,
    onTerminate: resetResponse,
  });

  // Handler for form submission
  const continueProcess = useCallback(async () => {
    try {
      setFulfillmentResponse({});
      const { sessionId, windowId, targetId, cdpWsUrl } = session;
      await requestFulfillTask({
        apiKey,
        sessionId: sessionId!,
        windowId: windowId!,
        targetId: targetId!,
        cdpWsUrl: cdpWsUrl!,
      });
    } catch (e: any) {
      handleError({
        error: e,
        consoleLogMessage: "Failed to execute task",
      });
    } finally {
      setFetching(false);
    }
  }, [session, apiKey, setFetching, requestFulfillTask, handleError, setFulfillmentResponse]);

  return (
    <div className="flex justify-between">
      <Button type="button" className="mr-4" onClick={onTerminateSession} variant="destructive">
        Terminate session
      </Button>
      {session.signInRequired && (
        <Button type="submit" onClick={continueProcess}>
          I've signed in
        </Button>
      )}
      {isFetching && <Spinner />}
    </div>
  );
}
