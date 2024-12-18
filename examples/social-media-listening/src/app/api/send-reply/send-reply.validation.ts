import { z } from "zod";

export const sendReplySchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().min(10).describe("The session ID to use for the request"),
  windowId: z.string().min(10).describe("The window ID to use for the request"),
  reply: z.string().min(10).describe("The reply to send"),
});

export const sendReplyResponseSchema = z.object({
  message: z.string().describe("The message to send"),
});

export type SendReplyRequest = z.infer<typeof sendReplySchema>;
export type SendReplyResponse = z.infer<typeof sendReplyResponseSchema>;
