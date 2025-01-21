import type { UrlState } from "@/graph/state.js";

// Name of the node
export const ERROR_HANDLER = "error-handler";

export const errorHandlerNode = (state: UrlState) => {
  const validUrlCount = state.urls.filter((url) => !!url?.isValid).length;

  if (validUrlCount === 0) {
  }

  return state;
};
