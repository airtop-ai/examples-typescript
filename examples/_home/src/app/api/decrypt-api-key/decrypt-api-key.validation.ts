import { z } from "zod";

export const decryptApiKeyRequestSchema = z.object({
  secret: z.string().describe("The encrypted API key"),
  nonce: z.string().describe("The nonce to use for decryption"),
  csrf: z.string().describe("The CSRF token to use for the request"),
});

export type DecryptApiKeyRequest = z.infer<typeof decryptApiKeyRequestSchema>;

export const decryptApiKeyResponseSchema = z.object({
  ok: z.boolean().describe("Whether the API key was successfully set"),
});

export type DecryptApiKeyResponse = z.infer<typeof decryptApiKeyResponseSchema>;
