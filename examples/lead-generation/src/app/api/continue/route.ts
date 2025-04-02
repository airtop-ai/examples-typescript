import { handleOptions, withCorsHeaders } from "@/app/api/shared/cors";
import { LeadGenerationEnrichmentGraph } from "@/graph/graph";
import type { Therapist } from "@/graph/state";
import { z } from "zod";

const continueRequestSchema = z.object({
  apiKey: z.string(),
  openAiKey: z.string(),
  therapists: z.array(
    z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      source: z.string().optional(),
      summary: z.string().optional(),
      outreachMessage: z.string().optional(),
    }),
  ),
});

export const maxDuration = 300;

export const OPTIONS = handleOptions;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, openAiKey, therapists } = continueRequestSchema.parse(body);

    const result = await LeadGenerationEnrichmentGraph(therapists as Therapist[], {
      apiKey,
      openAiKey,
    });

    return withCorsHeaders(result);
  } catch (error) {
    console.error("Error in continue endpoint:", error);
    return withCorsHeaders({ error: error instanceof Error ? error.message : "An unexpected error occurred" }, 500);
  }
}
