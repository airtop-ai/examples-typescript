import { CSV_GENERATOR_NODE_NAME, csvGeneratorNode } from "@/graph/nodes/csv-generator-node";
import { ERROR_HANDLER, errorHandlerNode } from "@/graph/nodes/error-handler-node";
import { OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode } from "@/graph/nodes/outreach-message-node";
import { ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode } from "@/graph/nodes/therapist-enrichment-node";
import { FETCH_THERAPISTS, fetchTherapistsNode } from "@/graph/nodes/therapist-fetcher-node";
import { URL_VALIDATOR, urlValidatorNode, validUrlCounterEdge } from "@/graph/nodes/url-validator-node";
import { state } from "@/graph/state";
import { END, START, StateGraph } from "@langchain/langgraph";

export const leadGenerationGraph = (graphInputs: string[]) => {
  const graphBuilder = new StateGraph(state)
    .addNode(URL_VALIDATOR, urlValidatorNode)
    .addNode(FETCH_THERAPISTS, fetchTherapistsNode)
    .addNode(ENRICH_THERAPISTS_NODE_NAME, enrichTherapistNode)
    .addNode(OUTREACH_MESSAGE_NODE_NAME, outreachMessageNode)
    .addNode(CSV_GENERATOR_NODE_NAME, csvGeneratorNode)
    .addNode(ERROR_HANDLER, errorHandlerNode);

  // Edges
  graphBuilder.addEdge(START, URL_VALIDATOR);
  graphBuilder.addConditionalEdges(URL_VALIDATOR, validUrlCounterEdge, [FETCH_THERAPISTS, ERROR_HANDLER]);
  graphBuilder.addEdge(FETCH_THERAPISTS, ENRICH_THERAPISTS_NODE_NAME);
  graphBuilder.addEdge(ENRICH_THERAPISTS_NODE_NAME, OUTREACH_MESSAGE_NODE_NAME);
  graphBuilder.addEdge(OUTREACH_MESSAGE_NODE_NAME, CSV_GENERATOR_NODE_NAME);
  graphBuilder.addEdge(CSV_GENERATOR_NODE_NAME, END);
  graphBuilder.addEdge(ERROR_HANDLER, END);

  const graph = graphBuilder.compile();

  graph.invoke({
    urls: graphInputs.map((url) => ({ url: url })),
  });
};
