import { z } from "zod";

export const fulfillRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().describe("The id of the session to continue"),
  windowId: z.string().describe("The id of the window to continue"),
  targetId: z.string().describe("The id of the page for puppeter interaction"),
  cdpWsUrl: z.string().describe("The url to connect to the browser"),
});

export type FulfillRequest = z.infer<typeof fulfillRequestSchema>;

export const fulfillResponseSchema = z.object({
  accomplished: z.boolean().optional().describe("Whether the task was done or not"),
  review: z.string().optional(),
  reply: z.string().optional(),
  error: z.string().optional(),
});

export type FulfillResponse = z.infer<typeof fulfillResponseSchema>;
