import { LeadGenerationSourcingGraph } from "@/graph/graph";
import { NextResponse } from "next/server";
import { startRequestSchema } from "./start.validation";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, openAiKey, urls } = startRequestSchema.parse(body);

    const result = await LeadGenerationSourcingGraph(urls, {
      apiKey,
      openAiKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in start endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
