import { leadGenerationGraphFinish } from "@/graph/graph";
import type { Therapist } from "@/graph/state";
import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, openAiKey, therapists } = continueRequestSchema.parse(body);

    const result = await leadGenerationGraphFinish(therapists as Therapist[], {
      apiKey,
      openAiKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in continue endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
