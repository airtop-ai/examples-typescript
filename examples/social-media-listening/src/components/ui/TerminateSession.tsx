import { useAppStore } from "@/store";
import { Button } from "@local/ui";
import { useTerminateSession } from "@local/ui";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

export function TerminateSession() {
  const sessionContext = useAppStore((state) => state.sessionContext);
  const sessionId = sessionContext?.session.id;
  const apiKey = useAppStore((state) => state.apiKey);
  const resetState = useAppStore((state) => state.resetState);

  // local state
  const [isTerminating, setIsTerminating] = useState(false);

  const terminateSession = useTerminateSession({
    apiKey,
    sessionId,
  });

  const handleTerminateSession = useCallback(async () => {
    setIsTerminating(true);
    await terminateSession();
    setIsTerminating(false);
    resetState();
  }, [terminateSession, resetState]);

  if (isTerminating) {
    return (
      <Button variant="destructive" disabled>
        <Loader2 className="animate-spin" />
        Ending session...
      </Button>
    );
  }

  return (
    <Button variant="destructive" onClick={handleTerminateSession}>
      End Session
    </Button>
  );
}
