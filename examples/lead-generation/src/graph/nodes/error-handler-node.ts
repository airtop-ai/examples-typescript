import type { StateAnnotation } from "@/graph/state";

// Name of the node
export const ERROR_HANDLER_NODE_NAME = "error-handler-node";

export enum ErrorCode {
  NO_VALID_URLS = "NO_VALID_URLS",
}

export const errorHandlerNode = (state: typeof StateAnnotation.State) => {
  let error = "";
  const validUrlCount = state.urls.filter((url) => !!url?.isValid).length;

  if (validUrlCount === 0) {
    error = ErrorCode.NO_VALID_URLS;
  }

  return {
    ...state,
    error,
  };
};
