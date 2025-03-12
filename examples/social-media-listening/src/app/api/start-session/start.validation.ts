import type { SessionContext } from "@/lib/x-interaction.service";
import { z } from "zod";

export const startSessionRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  profileName: z.string().optional().describe("The profile name to use for the session"),
});

export type StartSessionRequest = z.infer<typeof startSessionRequestSchema>;

export const startSessionResponseSchema = z.object({
  sessionId: z.string().optional().describe("The id of the created session"),
  windowId: z.string().optional().describe("The id of the created browser window"),
  liveViewUrl: z.string().optional().describe("The URL to connect to the browser live view"),
});

export type StartSessionResponse = SessionContext;
