"use client";

import { useContinueSession, useSendReply } from "@/app/hooks";
import { SignInForm } from "@/components/forms/SignInForm";
import { PostList } from "@/components/ui/PostList";
import { PostReplyCard } from "@/components/ui/PostReplyCard";
import { SendReply } from "@/components/ui/SendReply";
import { Step } from "@/components/ui/Step";
import { type AppState, useAppStore } from "@/store";

export interface IStepContext {
  appState: AppState;
  isSendingReply: boolean;
  onContinue?: () => Promise<void>;
  onSendReply?: () => Promise<void>;
}

interface IStep {
  title: string;
  description: string;
  component?: React.FC<IStepContext>;
}

const ALL_STEPS: IStep[] = [
  {
    title: "Create Window",
    description: "Creating a browser window to extract posts",
    component: ({ appState }) => (
      <div className="text-sm text-muted-foreground">
        <p className="pb-2">Session ID: {appState.sessionContext?.session.id}</p>
        <p>Profile Name: {appState.profileName}</p>
      </div>
    ),
  },
  {
    title: "Checking Sign In",
    description: "The agent is checking if you are signed in to x.com",
  },
  {
    title: "Sign In",
    description: "Verify if you are signed in to x.com",
    component: SignInForm,
  },
  {
    title: "Extract Posts",
    description: "Looking for posts that match your query",
    component: ({ appState }) => <PostList posts={appState.extractedPosts} showOpen={false} />,
  },
  {
    title: "Generate Reply",
    description: "Generating a reply to the first post.",
    component: ({ appState }) => {
      if (!appState.generatedReply) {
        return null;
      }
      return (
        <PostReplyCard
          username={appState.extractedPosts[0]?.username ?? ""}
          originalPost={appState.extractedPosts[0]?.text ?? ""}
          generatedReply={appState.generatedReply}
        />
      );
    },
  },
  {
    title: "Send Reply",
    description: "Sending the reply",
    component: SendReply,
  },
];

export function InProgressForm() {
  const appState = useAppStore();
  const { inProgressStatus } = appState;
  const onContinue = useContinueSession();
  const { sendReplyToThread, isSendingReply } = useSendReply();

  const handleSendReply = async () => {
    await sendReplyToThread();
  };

  const currentStep = Number(inProgressStatus);
  const steps = ALL_STEPS.slice(0, currentStep + 1);

  return (
    <div className="flex flex-col gap-4 px-4 max-h-[900px] overflow-y-auto">
      {steps.map((step, index) => (
        <Step
          key={step.title}
          title={step.title}
          description={currentStep <= index ? step.description : ""}
          isLoading={index === currentStep}
          isDone={currentStep > index}
        >
          {step.component?.({
            appState,
            onContinue,
            onSendReply: handleSendReply,
            isSendingReply,
          })}
        </Step>
      ))}
    </div>
  );
}
