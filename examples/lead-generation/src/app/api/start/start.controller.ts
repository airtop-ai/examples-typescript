import type { StartResponse } from "@/app/api/start/start.validation";
import { LeadGenerationSourcingGraph } from "@/graph/graph";

interface StartControllerParams {
  apiKey: string;
  openAiKey: string;
  urls: string[];
}

export async function startController({ urls, apiKey, openAiKey }: StartControllerParams): Promise<StartResponse> {
  // Execute the graph
  const result = await LeadGenerationSourcingGraph(urls, { apiKey, openAiKey });

  return {
    csvContent: result.csvContent,
    error: result.error,
  };
}
