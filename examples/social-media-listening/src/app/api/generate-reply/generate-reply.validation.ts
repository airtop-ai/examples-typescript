import { z } from "zod";

export const generateReplySchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().min(10).describe("The session ID to use for the request"),
  windowId: z.string().min(10).describe("The window ID to use for the request"),
  postLink: z.string().min(10).describe("The link to the post to reply to"),
  replyPrompt: z.string().describe("The prompt to use for the reply generation"),
});

export const generateReplyResponseSchema = z.object({
  reply: z.string(),
});

export type GenerateReplyRequest = z.infer<typeof generateReplySchema>;
export type GenerateReplyResponse = z.infer<typeof generateReplyResponseSchema>;
