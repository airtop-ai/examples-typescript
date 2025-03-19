import type { ConfigurableAnnotation } from "@/graph/state";
import { type ENRICHED_THERAPIST_SCHEMA, type StateAnnotation, THERAPIST_SCHEMA } from "@/graph/state";
import type { AirtopClient, BatchOperationError, BatchOperationInput, BatchOperationUrl } from "@airtop/sdk";
import type { RunnableConfig } from "@langchain/core/runnables";
import { getLogger } from "@local/utils";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ENRICHED_THERAPIST_JSON_SCHEMA = zodToJsonSchema(THERAPIST_SCHEMA);

// Name of the Enrich Therapist Node
export const ENRICH_THERAPISTS_NODE_NAME = "enrich-therapists-node";

const ENRICH_THERAPISTS_PROMPT = `
You are looking at a webpage that contains info about a specific therapist.
Your task is to enrich the therapist information with the following information:
- Name
- Email
- Phone
- Personal website of the therapist
- Summary of the therapist's information from the webpage
- Source of the webpage

Some of the information may not be available in the webpage, in that case just leave it blank.
For example, if the webpage does not contain any email address, you should leave the email field blank.

For the personal website of the therapist, you should extract the URL of the website.

If you cannot find the information, use the error field to report the problem.
If no errors are found, set the error field to an empty string.`;

/**
 * Enrich the therapists with the information from the website
 * @param state - The state of the therapist node.
 * @param config - The graph config containing the Airtop client
 * @returns The updated state of the therapist node.
 *
 *
 */

const parallelEnrichment = async (client: AirtopClient, urls: string[]) => {
  const session = await client.sessions.create();

  const result = await Promise.all(
    urls.map(async (url) => {
      const window = await client.windows.create(session.data.id, { url });
      const response = await client.windows.pageQuery(session.data.id, window.data.windowId, {
        prompt: ENRICH_THERAPISTS_PROMPT,
        configuration: {
          outputSchema: ENRICHED_THERAPIST_JSON_SCHEMA,
        },
      });

      if (!response.data.modelResponse || response.data.modelResponse === "") {
        throw new Error("An error occurred while enriching the therapist");
      }

      const enrichedTherapist = JSON.parse(response.data.modelResponse) as z.infer<typeof ENRICHED_THERAPIST_SCHEMA>;

      if (enrichedTherapist.error) {
        throw new Error(enrichedTherapist.error);
      }

      return enrichedTherapist;
    }),
  );

  return result;
};

export const enrichTherapistNode = async (
  state: typeof StateAnnotation.State,
  config: RunnableConfig<typeof ConfigurableAnnotation.State>,
) => {
  const therapistsLiveViewUrls: string[] = [];

  const log = getLogger().withPrefix("[enrichTherapistNode]");
  log.debug("Enriching therapists");

  const client = config.configurable!.airtopClient;

  const enrichmentInput: BatchOperationUrl[] = state.therapists
    .map((therapist) => {
      if (therapist.website) {
        return {
          url: therapist.website,
          context: { therapist: therapist },
        };
      }
      return null;
    })
    .filter(Boolean) as BatchOperationUrl[];

  const enrichOperation = async (input: BatchOperationInput) => {
    therapistsLiveViewUrls.push(input.liveViewUrl);

    const response = await client.windows.pageQuery(input.sessionId, input.windowId, {
      prompt: ENRICH_THERAPISTS_PROMPT,
      configuration: {
        outputSchema: ENRICHED_THERAPIST_JSON_SCHEMA,
      },
    });

    if (!response.data.modelResponse || response.data.modelResponse === "") {
      throw new Error("An error occurred while enriching the therapist");
    }

    const enrichedTherapist = JSON.parse(response.data.modelResponse) as z.infer<typeof ENRICHED_THERAPIST_SCHEMA>;

    if (enrichedTherapist.error) {
      throw new Error(enrichedTherapist.error);
    }

    return {
      data: enrichedTherapist,
    };
  };

  const handleError = async ({ error }: BatchOperationError) => {
    console.error("An error occurred while enriching the therapist", error);
  };

  const enrichedTherapists = await client.batchOperate(enrichmentInput, enrichOperation, { onError: handleError });

  return {
    ...state,
    therapists: enrichedTherapists,
  };
};
