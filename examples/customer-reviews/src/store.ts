import type { FulfillRequest, FulfillResponse } from "@/app/api/fulfill/fulfill.validation";
import type { StartRequest, StartResponse } from "@/app/api/start/start.validation";
import { getFetchBasePath } from "@local/utils";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  apiKey: string;
  session: StartResponse;
  taskFulfillment: FulfillResponse;
  fetching: boolean;
};

type Actions = {
  resetResponse: () => void;
  setApiKey: (apiKey: string) => void;
  setFetching: (fetching: boolean) => void;
  setStartResponse: (startResponse: StartResponse) => void;
  requestSessionStart: (data: StartRequest) => Promise<StartResponse>;
  setFulfillmentResponse: (continueResponse: FulfillResponse) => void;
  requestFulfillTask: (data: FulfillRequest) => Promise<void>;
};

export const useAppStore = create<State & Actions>()(
  immer((set) => ({
    apiKey: "",
    session: {},
    taskFulfillment: {},
    fetching: false,
    resetResponse: () => {
      set((state) => {
        state.session = {};
        state.taskFulfillment = {};
      });
    },
    setApiKey: (apiKey: string) => {
      set((state) => {
        state.apiKey = apiKey;
      });
    },
    setFetching: (fetching: boolean) => {
      set((state) => {
        state.fetching = fetching;
      });
    },
    setStartResponse: (startResponse: StartResponse) => {
      set((state) => {
        state.session = startResponse;
      });
    },
    // API Request for starting the session
    requestSessionStart: async (data: StartRequest) => {
      set((state) => {
        state.fetching = true;
      });
      const res = await fetch(`${getFetchBasePath()}/api/start`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const session = (await res.json()) as StartResponse;
      set((state) => {
        state.fetching = false;
        state.session = session;
      });
      return session;
    },
    setFulfillmentResponse: (fulfillResponse: FulfillResponse) => {
      set((state) => {
        state.session.signInRequired = false;
        state.taskFulfillment = fulfillResponse;
      });
    },
    // API Request for fulfilling the task
    requestFulfillTask: async (data: FulfillRequest) => {
      set((state) => {
        state.fetching = true;
      });
      console.log("Fulfill request: ", data);
      const res = await fetch(`${getFetchBasePath()}/api/fulfill`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        return;
      }
      const fulfillResponse = (await res.json()) as FulfillResponse;
      set((state) => {
        state.fetching = false;
        state.session.signInRequired = false;
        state.taskFulfillment = fulfillResponse;
      });
    },
  })),
);
