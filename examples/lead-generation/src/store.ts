import type { StartResponse } from "@/app/api/start/start.validation";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  apiKey: string;
  openAiKey: string;
  urls: string[];
  csvContent?: string;
  error?: string;
};

type Actions = {
  resetResponse: () => void;
  setApiKey: (apiKey: string) => void;
  setOpenAiKey: (openAiKey: string) => void;
  setStartResponse: (response: StartResponse) => void;
  setUrls: (urls: string[]) => void;
  setCsvContent: (content: string) => void;
  setError: (error: string) => void;
};

export const useAppStore = create<State & Actions>()(
  immer((set) => ({
    apiKey: "",
    openAiKey: "",
    urls: [],
    csvContent: undefined,
    error: undefined,

    resetResponse: () => {
      set((state) => {
        state.csvContent = undefined;
        state.error = undefined;
      });
    },
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setStartResponse: (response: StartResponse) => {
      set((state) => {
        state.csvContent = response.csvContent;
        state.error = response.error;
      });
    },
    setOpenAiKey: (openAiKey: string) => {
      set((state) => {
        state.openAiKey = openAiKey;
      });
    },
    setUrls: (urls: string[]) => {
      set((state) => {
        state.urls = urls;
      });
    },
    setCsvContent: (content: string) => {
      set((state) => {
        state.csvContent = content;
      });
    },
    setError: (error: string) => {
      set((state) => {
        state.error = error;
      });
    },
  })),
);
