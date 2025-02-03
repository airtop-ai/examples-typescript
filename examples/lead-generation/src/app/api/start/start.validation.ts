import { z } from "zod";

export const startRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  openAiKey: z.string().min(1).describe("Your OpenAI API key for content generation"),
  urls: z.array(z.string()).describe("List of URLs containing therapist information"),
});

export type StartRequest = z.infer<typeof startRequestSchema>;

export const startResponseSchema = z.object({
  csvContent: z.string().optional().describe("The generated CSV content"),
  error: z.string().optional().describe("Error message if something went wrong"),
});

export type StartResponse = z.infer<typeof startResponseSchema>;
