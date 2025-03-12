import { CSV_GENERATOR_NODE_NAME, csvGeneratorNode } from "@/graph/nodes/csv-generator-node";
import { ERROR_HANDLER_NODE_NAME, errorHandlerNode } from "@/graph/nodes/error-handler-node";
import { OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode } from "@/graph/nodes/outreach-message-node";
import { ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode } from "@/graph/nodes/therapist-enrichment-node";
import { FETCH_THERAPISTS_NODE_NAME, fetchTherapistsNode } from "@/graph/nodes/therapist-fetcher-node";
import { URL_VALIDATOR_NODE_NAME, urlValidatorNode } from "@/graph/nodes/url-validator-node";
import { ConfigurableAnnotation, type LeadGenerationGraphConfig, StateAnnotation, type Therapist } from "@/graph/state";
import { AirtopClient } from "@airtop/sdk";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
export type LeadGenerationGraphResult = {
  therapists: Therapist[];
  csvContent: string;
  csvPath: string;
  error: string;
};

/**
 * Lead Generation First Graph
 *
 * This graph is used to generate pull the initial data of the therapists from the provided websites.
 * It will validate the URLs, fetch the therapists, and handle any errors.
 * The output of this graph will later be passed to the second graph.
 *
 */
export const leadGenerationGraph = async (
  graphInputs: string[],
  config: LeadGenerationGraphConfig,
): Promise<LeadGenerationGraphResult> => {
  const graphBuilder = new StateGraph(StateAnnotation, ConfigurableAnnotation)
    .addNode(URL_VALIDATOR_NODE_NAME, urlValidatorNode, { ends: [FETCH_THERAPISTS_NODE_NAME, ERROR_HANDLER_NODE_NAME] })
    .addNode(FETCH_THERAPISTS_NODE_NAME, fetchTherapistsNode)
    .addNode(ERROR_HANDLER_NODE_NAME, errorHandlerNode);

  // Edges
  graphBuilder.addEdge(START, URL_VALIDATOR_NODE_NAME);
  graphBuilder.addEdge(FETCH_THERAPISTS_NODE_NAME, END);
  graphBuilder.addEdge(ERROR_HANDLER_NODE_NAME, END);

  const graph = graphBuilder.compile();

  const result = await graph.invoke(
    {
      urls: graphInputs.map((url) => ({ url: url })),
    },
    {
      configurable: {
        airtopClient: new AirtopClient({ apiKey: config.apiKey }),
        openAiClient: new ChatOpenAI({ apiKey: config.openAiKey }),
      },
    },
  );

  return result;
};

/**
 * Lead Generation Second Graph
 *
 * This graph is used to enrich the therapists and generate a CSV file with the results.
 * It will enrich the therapists information with their personalized website (if any), generate a CSV file with the results, and handle any errors.
 *
 */
export const leadGenerationGraphFinish = async (
  therapists: Therapist[],
  config: LeadGenerationGraphConfig,
): Promise<LeadGenerationGraphResult> => {
  const graphBuilder = new StateGraph(StateAnnotation, ConfigurableAnnotation)
    .addNode(ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode)
    .addNode(OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode)
    .addNode(CSV_GENERATOR_NODE_NAME, csvGeneratorNode);

  // Edges
  graphBuilder.addEdge(START, ENRICH_THERAPISTS_NODE_NAME);
  graphBuilder.addEdge(ENRICH_THERAPISTS_NODE_NAME, OUTREACH_MESSAGE_NODE_NAME);
  graphBuilder.addEdge(OUTREACH_MESSAGE_NODE_NAME, CSV_GENERATOR_NODE_NAME);
  graphBuilder.addEdge(CSV_GENERATOR_NODE_NAME, END);

  const graph = graphBuilder.compile();

  const result = await graph.invoke(
    {
      therapists,
    },
    {
      configurable: {
        airtopClient: new AirtopClient({ apiKey: config.apiKey }),
        openAiClient: new ChatOpenAI({ apiKey: config.openAiKey }),
      },
    },
  );

  return result;
};
