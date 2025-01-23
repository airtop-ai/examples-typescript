import type { StartResponse } from "@/app/api/start/start.validation";
import { leadGenerationGraph } from "@/graph/graph";

interface StartControllerParams {
  apiKey: string;
  openAiKey: string;
  urls: string[];
}

export async function startController({ urls }: StartControllerParams): Promise<StartResponse> {
  // Execute the graph
  const result = await leadGenerationGraph(urls);

  return {
    csvContent: result.csvContent,
    error: result.error,
  };
}
