import { z } from "zod";

export const setApiKeyRequestSchema = z.object({
  apiKey: z.string().describe("The API key to save to the session"),
});

export type SetApiKeyRequest = z.infer<typeof setApiKeyRequestSchema>;

export const setApiKeyResponseSchema = z.object({
  ok: z.boolean().describe("Whether the request was successful"),
});

export type SetApiKeyResponse = z.infer<typeof setApiKeyResponseSchema>;
