import { handleOptions, withCorsHeaders } from "@/app/api/shared/cors";
import { LeadGenerationSourcingGraph } from "@/graph/graph";
import { startRequestSchema } from "./start.validation";

export const maxDuration = 300;

export const OPTIONS = handleOptions;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, openAiKey, urls } = startRequestSchema.parse(body);

    const result = await LeadGenerationSourcingGraph(urls, {
      apiKey,
      openAiKey,
    });

    return withCorsHeaders(result);
  } catch (error) {
    console.error("Error in start endpoint:", error);
    return withCorsHeaders({ error: error instanceof Error ? error.message : "An unexpected error occurred" }, 500);
  }
}
