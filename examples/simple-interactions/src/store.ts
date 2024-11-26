import type { ProcessInteractionsResponse } from "@/app/api/process-interactions/process-interactions.validation";
import type { StartResponse } from "@/app/api/start/start.validation";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  apiKey: string;
  response: StartResponse & ProcessInteractionsResponse;
};

type Actions = {
  resetResponse: () => void;
  setApiKey: (apiKey: string) => void;
  setStartResponse: (startResponse: StartResponse) => void;
  setProcessInteractionsResponse: (processInteractionsResponse: ProcessInteractionsResponse) => void;
};

export const useAppStore = create<State & Actions>()(
  immer((set) => ({
    apiKey: "",
    response: {},
    resetResponse: () => {
      set((state) => {
        state.response = {};
      });
    },
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setStartResponse: (startResponse: StartResponse) => {
      set((state) => {
        state.response = startResponse;
      });
    },
    setProcessInteractionsResponse: (processInteractionsResponse: ProcessInteractionsResponse) => {
      set((state) => {
        state.response.content = processInteractionsResponse.content;
      });
    },
  })),
);
