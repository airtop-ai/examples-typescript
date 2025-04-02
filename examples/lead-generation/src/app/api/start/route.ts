import { LeadGenerationSourcingGraph } from "@/graph/graph";
import { NextResponse } from "next/server";
import { startRequestSchema } from "./start.validation";

export const maxDuration = 300;

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  try {
    // Add CORS headers to the response
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const body = await request.json();
    const { apiKey, openAiKey, urls } = startRequestSchema.parse(body);

    const result = await LeadGenerationSourcingGraph(urls, {
      apiKey,
      openAiKey,
    });

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Error in start endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}
