import type { StateAnnotation, Url, UrlOutput } from "@/graph/state";
import { URL_VALIDATOR_OUTPUT_SCHEMA } from "@/graph/state";
import type { ConfigurableAnnotation } from "@/graph/state";
import type { BatchOperationError, BatchOperationInput, BatchOperationResponse } from "@airtop/sdk";
import type { RunnableConfig } from "@langchain/core/runnables";
import { Command } from "@langchain/langgraph";
import { getLogger } from "@local/utils";
import isUrl from "validator/lib/isURL";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ERROR_HANDLER_NODE_NAME } from "./error-handler-node";
import { FETCH_THERAPISTS_NODE_NAME } from "./therapist-fetcher-node";

// Name of the node
export const URL_VALIDATOR_NODE_NAME = "url-validator-node";

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
 * @param config - The graph config containing the Airtop client
 * @returns The graph state with the validated URLs and the next node to execute
 */
export const urlValidatorNode = async (
  state: typeof StateAnnotation.State,
  config: RunnableConfig<typeof ConfigurableAnnotation.State>,
) => {
  const log = getLogger().withPrefix("[urlValidatorNode]");
  log.withMetadata({ urls: state.urls }).debug("Validating URLs");

  const airtopClient = config.configurable!.airtopClient;

  const links = state.urls.map((url) => ({ url: url.url })).filter((url) => isUrl(url.url));

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

  log.withMetadata({ urls: validatedUrls }).debug("Urls that were validated");

  return new Command({
    update: {
      ...state,
      urls: validatedUrls.filter((url) => url.isValid),
    },
    goto: validatedUrls.filter((url) => url.isValid).length > 0 ? FETCH_THERAPISTS_NODE_NAME : ERROR_HANDLER_NODE_NAME,
  });
};
