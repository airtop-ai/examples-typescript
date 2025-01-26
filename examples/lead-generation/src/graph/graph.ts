import { CSV_GENERATOR_NODE_NAME, csvGeneratorNode } from "@/graph/nodes/csv-generator-node";
import { ERROR_HANDLER_NODE_NAME, errorHandlerNode } from "@/graph/nodes/error-handler-node";
import { OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode } from "@/graph/nodes/outreach-message-node";
import { ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode } from "@/graph/nodes/therapist-enrichment-node";
import { FETCH_THERAPISTS_NODE_NAME, fetchTherapistsNode } from "@/graph/nodes/therapist-fetcher-node";
import { URL_VALIDATOR_NODE_NAME, urlValidatorNode, validUrlCounterEdge } from "@/graph/nodes/url-validator-node";
import { ConfigurableAnnotation, type LeadGenerationGraphConfig, StateAnnotation } from "@/graph/state";
import { AirtopClient } from "@airtop/sdk";
import { END, START, StateGraph } from "@langchain/langgraph";
import { OpenAI } from "@langchain/openai";
export type LeadGenerationGraphResult = {
  csvContent: string;
  csvPath: string;
  error: string;
};

export const leadGenerationGraph = async (
  graphInputs: string[],
  config: LeadGenerationGraphConfig,
): Promise<LeadGenerationGraphResult> => {
  const graphBuilder = new StateGraph(StateAnnotation, ConfigurableAnnotation)
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

  const airtopClient = new AirtopClient({ apiKey: config.apiKey });
  const openAiClient = new OpenAI({ apiKey: config.openAiKey });

  const result = await graph.invoke(
    {
      urls: graphInputs.map((url) => ({ url: url })),
    },
    {
      configurable: {
        airtopClient,
        openAiClient,
      },
    },
  );

  return result;
};
