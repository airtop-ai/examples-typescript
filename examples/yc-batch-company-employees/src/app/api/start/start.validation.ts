import { z } from "zod";

export const startRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  profileName: z.string().min(1, "Profile name is required").describe("The profile name to use for the session"),
});

export type StartRequest = z.infer<typeof startRequestSchema>;

export const startResponseSchema = z.object({
  sessionId: z.string().optional().describe("The id of the created session"),
  windowId: z.string().optional().describe("The id of the created browser window"),
  profileName: z.string().optional().describe("The provided profile name to continue the session"),
  liveViewUrl: z.string().optional().describe("The URL to connect to the browser live view"),
  signInRequired: z.boolean().optional().describe("Whether the user needs to sign in"),
  content: z.string().optional().describe("The response to the prompt only if signInRequired is false"),
  batches: z.array(z.string()).optional().describe("The list of YC batches"),
});

export type StartResponse = z.infer<typeof startResponseSchema>;
