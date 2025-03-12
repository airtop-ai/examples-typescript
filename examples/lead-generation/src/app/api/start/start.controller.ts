import type { StartResponse } from "@/app/api/start/start.validation";
import { leadGenerationGraphPart1 } from "@/graph/graph";

interface StartControllerParams {
  apiKey: string;
  openAiKey: string;
  urls: string[];
}

export async function startController({ urls, apiKey, openAiKey }: StartControllerParams): Promise<StartResponse> {
  // Execute the graph
  const result = await leadGenerationGraphPart1(urls, { apiKey, openAiKey });

  return {
    csvContent: result.csvContent,
    error: result.error,
  };
}
