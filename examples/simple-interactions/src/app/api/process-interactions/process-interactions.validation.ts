import { z } from "zod";

export const processInteractionsRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  ticker: z.string().optional().describe("(optional) The ticker to search (Defaults to 'NVDA')"),
  sessionId: z.string().describe("The id of the session to continue"),
  windowId: z.string().describe("The id of the window to continue"),
});

export type ProcessInteractionsRequest = z.infer<typeof processInteractionsRequestSchema>;

export const processInteractionsResponseSchema = z.object({
  content: z.string().optional().describe("The response to the prompt"),
});

export type ProcessInteractionsResponse = z.infer<typeof processInteractionsResponseSchema>;
