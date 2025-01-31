import {
  type ConfigurableAnnotation,
  type StateAnnotation,
  THERAPISTS_OUTPUT_JSON_SCHEMA,
  type THERAPISTS_OUTPUT_SCHEMA,
  type TherapistState,
} from "@/graph/state";
import type { BatchOperationError, BatchOperationInput, BatchOperationResponse } from "@airtop/sdk";
import type { RunnableConfig } from "@langchain/core/runnables";
import { getLogger } from "@local/utils";
import type { z } from "zod";

const FETCH_THERAPISTS_PROMPT = `
You are looking at a webpage that contains a list of therapists.
Your task is to try to extract the following information from the webpage:
For each therapist, extract the following information:
- Name
- Email
- Phone
- Personal website or detail page about the therapist in the webpage.
- Source of the webpage
Some of the information may not be available in the webpage, in that case just leave it blank.
For example, if the webpage does not contain any email address, you should leave the email field blank.

For the personal website or detail page about the therapist, you should extract the URL of the website.
Only extract the first 5 therapists in the list.

If you cannot find the information, use the error field to report the problem.
If no errors are found, set the error field to an empty string.
`;

// Name of the fetch therapists node
export const FETCH_THERAPISTS_NODE_NAME = "therapist-fetcher-node";

/**
 * Fetches the therapists from the URLs in the state
 * @param state - The state of the URL validator node.
 * @param config - The graph config containing the Airtop client
 * @returns The updated state of the URL validator node.
 */
export const fetchTherapistsNode = async (
  state: typeof StateAnnotation.State,
  config: RunnableConfig<typeof ConfigurableAnnotation.State>,
) => {
  const log = getLogger().withPrefix("[fetchTherapistsNode]");

  const websiteLinks = state.urls.map((url) => ({ url: url.url }));

  const airtopClient = config.configurable!.airtopClient;

  const fetchTherapists = async (input: BatchOperationInput): Promise<BatchOperationResponse<TherapistState>> => {
    const modelResponse = await airtopClient.windows.pageQuery(input.sessionId, input.windowId, {
      prompt: FETCH_THERAPISTS_PROMPT,
      configuration: {
        outputSchema: THERAPISTS_OUTPUT_JSON_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("An error occurred while fetching the therapists");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as z.infer<typeof THERAPISTS_OUTPUT_SCHEMA>;

    if (response.error) {
      throw new Error(response.error);
    }

    return {
      data: { therapists: response.therapists },
    };
  };

  const handleError = async ({ error }: BatchOperationError) => {
    log.withError(error).error("An error occurred while fetching the therapists");
  };

  const results = await airtopClient.batchOperate(websiteLinks, fetchTherapists, { onError: handleError });

  log.withMetadata({ results }).debug("Fetched therapists successfully");

  // We expect the response to be an array of one object with the therapists.
  // For that reason, we set the state field of therapists to that single object
  return {
    ...state,
    therapists: results.flatMap((result) => result.therapists),
  };
};
