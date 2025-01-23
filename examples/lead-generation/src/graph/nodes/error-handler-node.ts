import type { UrlState } from "@/graph/state.js";

// Name of the node
export const ERROR_HANDLER = "error-handler";

export const errorHandlerNode = (state: UrlState) => {
  let error = "";
  const validUrlCount = state.urls.filter((url) => !!url?.isValid).length;

  if (validUrlCount === 0) {
    error = "No valid URLs provided";
  }

  return {
    ...state,
    error,
  };
};
