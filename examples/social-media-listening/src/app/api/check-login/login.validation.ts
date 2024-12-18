import { z } from "zod";

export const checkLoginRequestSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().min(10).describe("The session ID to use for the request"),
  windowId: z.string().min(10).describe("The window ID to use for the request"),
});

export type CheckLoginRequest = z.infer<typeof checkLoginRequestSchema>;

export const checkLoginResponseSchema = z.object({
  isSignedIn: z.boolean().describe("Whether the user is signed in"),
});

export type CheckLoginResponse = z.infer<typeof checkLoginResponseSchema>;
