import type { SearchPostsResponse } from "@/app/api/search-posts/search.validation";
import type { StartSessionResponse } from "@/app/api/start-session/start.validation";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * @enum {number} InProgressStatus
 * @description The status of the in-progress session
 * @property {number} CREATING_WINDOW - Creating the browser window
 * @property {number} CHECK_SIGN_IN - Checking if the user is signed in
 * @property {number} NEED_SIGN_IN - Needing the user to sign in
 * @property {number} EXTRACTING_POSTS - Extracting posts
 * @property {number} GENERATING_REPLY - Generating a reply
 * @property {number} SENDING_REPLY - Sending a reply
 */
export enum InProgressStatus {
  CREATING_WINDOW = 0,
  CHECK_SIGN_IN = 1,
  NEED_SIGN_IN = 2,
  EXTRACTING_POSTS = 3,
  GENERATING_REPLY = 4,
  SENDING_REPLY = 5,
}

export type AppState = {
  apiKey: string;
  profileId?: string;
  sessionContext: StartSessionResponse | null;
  userIsSignedIn: boolean;
  status: "start" | "in_progress" | "completed";
  inProgressStatus: InProgressStatus | null;
  extractedPosts: SearchPostsResponse["posts"];
  generatedReply: string;
  taskParams: {
    query: string;
    matchPrompt: string;
    replyPrompt: string;
    resultLimit: number;
  };
  result: {
    success: boolean;
    error?: string;
  };
};

type Actions = {
  setApiKey: (apiKey: string) => void;
  setProfileId: (profileId: string) => void;
  resetState: () => void;
  setStatus: (status: AppState["status"]) => void;
  setGeneratedReply: (generatedReply: AppState["generatedReply"]) => void;
  setSessionContext: (sessionContext: StartSessionResponse) => void;
  setTaskParams: (taskParams: AppState["taskParams"]) => void;
  setExtractedPosts: (extractedPosts: AppState["extractedPosts"]) => void;
  setInProgressStatus: (inProgressStatus: AppState["inProgressStatus"]) => void;
  setResult: (result: AppState["result"]) => void;
  setUserIsSignedIn: (userIsSignedIn: boolean) => void;
};

const initialState: AppState = {
  apiKey: "",
  profileId: "",
  sessionContext: null,
  userIsSignedIn: false,
  status: "start",
  inProgressStatus: null,
  extractedPosts: [],
  generatedReply: "",
  taskParams: {
    query: "",
    matchPrompt: "",
    replyPrompt: "",
    resultLimit: 5,
  },
  result: {
    success: false,
    error: "",
  },
};

export const useAppStore = create<AppState & Actions>()(
  immer((set) => ({
    ...initialState,
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setProfileId: (profileId: string) => {
      set((state) => {
        state.profileId = profileId;
      });
    },
    resetState: () => {
      set(initialState);
    },
    setStatus: (status: AppState["status"]) => {
      set((state) => {
        state.status = status;
      });
    },
    setUserIsSignedIn: (userIsSignedIn: boolean) => {
      set((state) => {
        state.userIsSignedIn = userIsSignedIn;
      });
    },
    setSessionContext: (sessionContext: StartSessionResponse) => {
      set((state) => {
        state.sessionContext = sessionContext;
      });
    },
    setTaskParams: (taskParams: AppState["taskParams"]) => {
      set((state) => {
        state.taskParams = taskParams;
      });
    },
    setExtractedPosts: (extractedPosts: AppState["extractedPosts"]) => {
      set((state) => {
        state.extractedPosts = extractedPosts;
      });
    },
    setGeneratedReply: (generatedReply: AppState["generatedReply"]) => {
      set((state) => {
        state.generatedReply = generatedReply;
      });
    },
    setInProgressStatus: (inProgressStatus: AppState["inProgressStatus"]) => {
      set((state) => {
        state.inProgressStatus = inProgressStatus;
      });
    },
    setResult: (result: AppState["result"]) => {
      set((state) => {
        state.result = result;
      });
    },
  })),
);
