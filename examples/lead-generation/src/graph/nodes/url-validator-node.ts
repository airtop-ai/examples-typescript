import { getAirtopClient } from "@/airtop-client.js";
import type { Url, UrlOutput, UrlState } from "@/graph/state.js";
import { URL_VALIDATOR_OUTPUT_SCHEMA } from "@/graph/state.js";
import type { BatchOperationError, BatchOperationInput, BatchOperationResponse } from "@airtop/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";

// Name of the edge
export const VALID_URL_COUNTER_EDGE = "valid-url-counter-edge";

/**
 * Conditional edge that determines if the graph should continue to the next node based on valid URLs or go to the error handler
 * @param state - The state of the URL node
 * @returns The next edge to take
 */
export const validUrlCounterEdge = (state: UrlState): string => {
  const validUrlCount = state.urls.filter((url) => !!url?.isValid).length;

  return validUrlCount > 0 ? "fetch-therapists" : "error-handler";
};

/**
 * Validates a string to determine if it is a valid URL
 * @param url - The URL to validate
 * @returns Whether the URL is valid
 */
const validateString = (url: string): boolean => {
  try {
    // Basic string checks
    if (!url?.trim()) {
      return false;
    }

    if (url.length > 2048) {
      return false;
    }

    // Parse the URL
    const parsed = new URL(url);

    // Check scheme
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    // Check domain format and invalid characters
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(parsed.hostname)) {
      return false;
    }

    // Check for common invalid characters
    const invalidChars = '<>"{}|\\^`';
    if ([...invalidChars].some((char) => url.includes(char))) {
      return false;
    }

    // Check for at least one dot in domain (redundant with URL parsing but kept for parity)
    if (!parsed.hostname.includes(".")) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

// Name of the node
export const URL_VALIDATOR = "url-validator";

export const URL_VALIDATOR_PROMPT = `
You are looking at a webpage.
Your task is to determine if the webpage matches the following criteria:
- The webpage is a valid website
- The webpage contains a list of therapists
- The list of therapists is not empty
- The therapist contain at least one of the following fields:
    - Name
    - Email
    - Phone
    - Website
`;

/**
 * Uses Airtop's PageQuery API to validate an URL to determine if it contains a list of therapists
 * @param state - The graph state containing the URLs to validate
 * @returns The graph state with the validated URLs
 */
export const urlValidatorNode = async (state: UrlState) => {
  const airtopClient = getAirtopClient(process.env.AIRTOP_API_KEY!);

  const links = state.urls.map((url) => ({ url: url.url })).filter((url) => validateString(url.url));

  const validateUrl = async (input: BatchOperationInput): Promise<BatchOperationResponse<Url>> => {
    const modelResponse = await airtopClient.windows.pageQuery(input.sessionId, input.windowId, {
      prompt: URL_VALIDATOR_PROMPT,
      configuration: {
        outputSchema: zodToJsonSchema(URL_VALIDATOR_OUTPUT_SCHEMA),
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("An error occurred while validating the URL");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as UrlOutput;

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.isValid) {
      throw new Error("The URL does not match the criteria");
    }

    return {
      data: { url: input.operationUrl.url, isValid: response.isValid },
    };
  };

  const handleError = async ({ error }: BatchOperationError) => {};

  const validatedUrls = await airtopClient.batchOperate(links, validateUrl, { onError: handleError });

  return {
    ...state,
    urls: validatedUrls.filter((url) => url.isValid),
  };
};
