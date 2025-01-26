import type { UrlState } from "@/graph/state";

// Name of the node
export const ERROR_HANDLER_NODE_NAME = "error-handler-node";

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
