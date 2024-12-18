import type { IStepContext } from "@/components/forms/InProgressForm";
import { InProgressStatus } from "@/store";
import { Button } from "@local/ui";
import { Loader2 } from "lucide-react";

export function SendReply({ appState, onSendReply, isSendingReply }: IStepContext) {
  if (!appState.generatedReply || appState.inProgressStatus !== InProgressStatus.SENDING_REPLY) {
    return null;
  }

  if (isSendingReply) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Responding to thread...
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p>Do you want to post the generated reply above?</p>
      <Button variant="outline" onClick={onSendReply}>
        Post
      </Button>
    </div>
  );
}
