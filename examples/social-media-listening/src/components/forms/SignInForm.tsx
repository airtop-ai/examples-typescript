"use client";

import { InProgressStatus } from "@/store";
import { Button } from "@local/ui";
import type { IStepContext } from "./InProgressForm";

export function SignInForm({ appState, onContinue }: IStepContext) {
  const { inProgressStatus } = appState;

  if (inProgressStatus && inProgressStatus > InProgressStatus.NEED_SIGN_IN) {
    return <p className="text-center text-sm">User is signed in</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p>Please sign in and click on "Continue" to proceed</p>
      <Button className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
