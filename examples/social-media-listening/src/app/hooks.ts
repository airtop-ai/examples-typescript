"use client";
import { InProgressStatus, useAppStore } from "@/store";
import { useHandleError, useTerminateSession } from "@local/ui";
import { getFetchBasePath } from "@local/utils";
import { getLogger } from "@local/utils";
import { useState } from "react";
import type { CheckLoginResponse } from "./api/check-login/login.validation";
import type { GenerateReplyResponse } from "./api/generate-reply/generate-reply.validation";
import type { SearchPostsResponse } from "./api/search-posts/search.validation";
import type { SendReplyResponse } from "./api/send-reply/send-reply.validation";
import type { StartSessionResponse } from "./api/start-session/start.validation";

interface SessionParams {
  profileName?: string;
  query: string;
  matchPrompt: string;
  resultLimit: number;
  replyPrompt: string;
}

interface ApiContext {
  apiKey: string;
  sessionId: string;
  windowId: string;
  [key: string]: string | number;
}

const logger = getLogger();

// API Requests
export const startAirtopSession = async (apiKey: string, profileName?: string): Promise<StartSessionResponse> => {
  const response = await fetch(`${getFetchBasePath()}/api/start-session`, {
    method: "POST",
    body: JSON.stringify({ apiKey, profileName }),
  });

  const data = (await response.json()) as StartSessionResponse;
  return data;
};

export const getSignInStatus = async ({ apiKey, sessionId, windowId }: ApiContext): Promise<CheckLoginResponse> => {
  const response = await fetch(`${getFetchBasePath()}/api/check-login`, {
    method: "POST",
    body: JSON.stringify({ apiKey, sessionId, windowId }),
  });

  const data = (await response.json()) as CheckLoginResponse;
  return data;
};

export const searchPosts = async ({
  apiKey,
  sessionId,
  windowId,
  query,
  matchPrompt,
  resultLimit,
}: ApiContext): Promise<SearchPostsResponse> => {
  const response = await fetch(`${getFetchBasePath()}/api/search-posts`, {
    method: "POST",
    body: JSON.stringify({ apiKey, sessionId, windowId, query, matchPrompt, resultLimit }),
  });

  const data = (await response.json()) as SearchPostsResponse;
  return data;
};

export const generateReply = async ({
  apiKey,
  sessionId,
  windowId,
  postLink,
  replyPrompt,
}: ApiContext): Promise<GenerateReplyResponse> => {
  const response = await fetch(`${getFetchBasePath()}/api/generate-reply`, {
    method: "POST",
    body: JSON.stringify({ apiKey, sessionId, windowId, postLink, replyPrompt }),
  });

  const data = (await response.json()) as GenerateReplyResponse;
  return data;
};

export const sendReply = async ({ apiKey, sessionId, windowId, reply }: ApiContext): Promise<SendReplyResponse> => {
  const response = await fetch(`${getFetchBasePath()}/api/send-reply`, {
    method: "POST",
    body: JSON.stringify({ apiKey, sessionId, windowId, reply }),
  });

  const data = (await response.json()) as SendReplyResponse;
  return data;
};

// Hooks
export const useStartSession = () => {
  // Store state and actions
  const { apiKey } = useAppStore();
  const setStatus = useAppStore((state) => state.setStatus);
  const setSessionContext = useAppStore((state) => state.setSessionContext);
  const setUserIsSignedIn = useAppStore((state) => state.setUserIsSignedIn);
  const setResult = useAppStore((state) => state.setResult);
  const setInProgressStatus = useAppStore((state) => state.setInProgressStatus);
  const setExtractedPosts = useAppStore((state) => state.setExtractedPosts);
  const setGeneratedReply = useAppStore((state) => state.setGeneratedReply);

  const handleError = useHandleError();
  const [isLoading, setIsLoading] = useState(false);

  const handleSessionError = (error: Error, message: string) => {
    handleError({
      error: { type: "Error", error },
      consoleLogMessage: message,
    });
    setResult({
      success: false,
      error: String(error),
    });
    setIsLoading(false);
  };

  const startSession = async ({ profileName, query, matchPrompt, resultLimit, replyPrompt }: SessionParams) => {
    try {
      setIsLoading(true);
      setStatus("in_progress");

      // Start session
      setInProgressStatus(InProgressStatus.CREATING_WINDOW);
      const sessionCtx = await startAirtopSession(apiKey, profileName);
      setSessionContext(sessionCtx);

      const apiContext: ApiContext = {
        apiKey,
        sessionId: sessionCtx.session.id,
        windowId: sessionCtx.windowInfo.windowId,
      };

      // Check login
      setInProgressStatus(InProgressStatus.CHECK_SIGN_IN);
      const { isSignedIn } = await getSignInStatus(apiContext);

      if (!isSignedIn) {
        setUserIsSignedIn(false);
        setInProgressStatus(InProgressStatus.NEED_SIGN_IN);
        return;
      }
      setUserIsSignedIn(true);

      // Search posts
      setInProgressStatus(InProgressStatus.EXTRACTING_POSTS);
      const { posts } = await searchPosts({
        ...apiContext,
        query,
        matchPrompt,
        resultLimit: Number(resultLimit),
      });

      if (!posts?.length) {
        throw new Error("No posts found");
      }

      logger.info(`Found posts: ${posts.length}`);
      setExtractedPosts(posts);

      // Generate reply
      setInProgressStatus(InProgressStatus.GENERATING_REPLY);
      const { reply } = await generateReply({
        ...apiContext,
        postLink: posts[0]?.link ?? "",
        replyPrompt,
      });

      setGeneratedReply(reply);
      setInProgressStatus(InProgressStatus.SENDING_REPLY);
      setIsLoading(false);
    } catch (error) {
      handleSessionError(error as Error, "Failed to complete the task");
    }
  };

  return { startSession, isLoading };
};

export const useContinueSession = () => {
  // app state and actions
  const {
    apiKey,
    sessionContext,
    taskParams,
    setUserIsSignedIn,
    setInProgressStatus,
    setExtractedPosts,
    setGeneratedReply,
  } = useAppStore();
  const handleError = useHandleError();

  const continueSession = async () => {
    if (!sessionContext) {
      throw new Error("No session context found");
    }

    const apiContext: ApiContext = {
      apiKey,
      sessionId: sessionContext.session.id,
      windowId: sessionContext.windowInfo.windowId,
    };

    try {
      setUserIsSignedIn(true);

      // Search posts
      setInProgressStatus(InProgressStatus.EXTRACTING_POSTS);
      const { posts } = await searchPosts({
        ...apiContext,
        query: taskParams.query,
        matchPrompt: taskParams.matchPrompt,
        resultLimit: Number(taskParams.resultLimit),
      });

      if (!posts?.length) {
        throw new Error("No posts found");
      }

      setExtractedPosts(posts);

      // Generate reply
      setInProgressStatus(InProgressStatus.GENERATING_REPLY);
      const { reply } = await generateReply({
        ...apiContext,
        postLink: posts[0]?.link ?? "",
        replyPrompt: taskParams.replyPrompt,
      });

      setGeneratedReply(reply);
      setInProgressStatus(InProgressStatus.SENDING_REPLY);
    } catch (error: any) {
      handleError({
        error: { type: "Error", error },
        consoleLogMessage: "Failed to continue the task",
      });
    }
  };

  return continueSession;
};

export const useSendReply = () => {
  const { apiKey, sessionContext, generatedReply } = useAppStore();
  const setInProgressStatus = useAppStore((state) => state.setInProgressStatus);
  const setStatus = useAppStore((state) => state.setStatus);
  const setResult = useAppStore((state) => state.setResult);
  const handleError = useHandleError();
  const terminateSession = useTerminateSession({
    apiKey,
    sessionId: sessionContext?.session.id || "",
  });

  const [isSendingReply, setIsSendingReply] = useState(false);

  const sendReplyToThread = async (): Promise<void> => {
    if (!sessionContext) {
      throw new Error("No session found");
    }

    try {
      setIsSendingReply(true);
      await sendReply({
        apiKey,
        sessionId: sessionContext.session.id,
        windowId: sessionContext.windowInfo.windowId,
        reply: generatedReply,
      });

      setInProgressStatus(null);
      setStatus("completed");
      setResult({
        success: true,
        error: "",
      });
      terminateSession();
      setIsSendingReply(false);
    } catch (error: any) {
      handleError({
        error: { type: "Error", error },
        consoleLogMessage: "Failed to send reply to thread",
      });
      setIsSendingReply(false);
    }
  };

  return { sendReplyToThread, isSendingReply };
};
