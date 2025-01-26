import { removeAirtopClient } from "@/airtop-client";
import { CSV_GENERATOR_NODE_NAME, csvGeneratorNode } from "@/graph/nodes/csv-generator-node";
import { ERROR_HANDLER_NODE_NAME, errorHandlerNode } from "@/graph/nodes/error-handler-node";
import { OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode } from "@/graph/nodes/outreach-message-node";
import { removeOpenAiClient } from "@/graph/nodes/outreach-message-node";
import { ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode } from "@/graph/nodes/therapist-enrichment-node";
import { FETCH_THERAPISTS_NODE_NAME, fetchTherapistsNode } from "@/graph/nodes/therapist-fetcher-node";
import { URL_VALIDATOR_NODE_NAME, urlValidatorNode, validUrlCounterEdge } from "@/graph/nodes/url-validator-node";
import { type LeadGenerationGraphConfig, state } from "@/graph/state";
import { END, START, StateGraph } from "@langchain/langgraph";

export type LeadGenerationGraphResult = {
  csvContent: string;
  csvPath: string;
  error: string;
};

export type { LeadGenerationGraphConfig };

export const leadGenerationGraph = async (
  graphInputs: string[],
  config: LeadGenerationGraphConfig,
): Promise<LeadGenerationGraphResult> => {
  const graphBuilder = new StateGraph(state)
    .addNode(URL_VALIDATOR_NODE_NAME, urlValidatorNode)
    .addNode(FETCH_THERAPISTS_NODE_NAME, fetchTherapistsNode)
    .addNode(ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode)
    .addNode(OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode)
    .addNode(CSV_GENERATOR_NODE_NAME, csvGeneratorNode)
    .addNode(ERROR_HANDLER_NODE_NAME, errorHandlerNode);

  // Edges
  graphBuilder.addEdge(START, URL_VALIDATOR_NODE_NAME);
  graphBuilder.addConditionalEdges(URL_VALIDATOR_NODE_NAME, validUrlCounterEdge, [
    FETCH_THERAPISTS_NODE_NAME,
    ERROR_HANDLER_NODE_NAME,
  ]);
  graphBuilder.addEdge(FETCH_THERAPISTS_NODE_NAME, ENRICH_THERAPISTS_NODE_NAME);
  graphBuilder.addEdge(ENRICH_THERAPISTS_NODE_NAME, OUTREACH_MESSAGE_NODE_NAME);
  graphBuilder.addEdge(OUTREACH_MESSAGE_NODE_NAME, CSV_GENERATOR_NODE_NAME);
  graphBuilder.addEdge(CSV_GENERATOR_NODE_NAME, END);
  graphBuilder.addEdge(ERROR_HANDLER_NODE_NAME, END);

  const graph = graphBuilder.compile();

  const result = await graph.invoke({
    urls: graphInputs.map((url) => ({ url: url })),
    config,
  });

  // Cleanup
  removeAirtopClient(config.apiKey);
  removeOpenAiClient(config.openAiKey);

  return result;
};
