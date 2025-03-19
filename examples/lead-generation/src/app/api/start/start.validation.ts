import type { Therapist } from "@/graph/state";
import { z } from "zod";

export const startRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  openAiKey: z.string().min(1).describe("Your OpenAI API key for content generation"),
  urls: z.array(z.string().url()).describe("List of URLs containing therapist information"),
});

export type StartRequest = z.infer<typeof startRequestSchema>;

export type StartResponse = {
  therapists?: Therapist[];
  csvContent?: string;
  error?: string;
};
