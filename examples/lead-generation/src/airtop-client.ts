import { AirtopClient } from "@airtop/sdk";

// Use a Map to store clients with their API keys as unique identifiers
const clientsMap = new Map<string, AirtopClient>();

/**
 * Get an AirtopClient instance using a cache pattern with API key as the unique identifier.
 * This ensures each API key gets its own client instance while preventing duplicate clients
 * for the same API key.
 * @param apiKey - The API key for the AirtopClient.
 * @returns An instance of AirtopClient.
 */
export const getAirtopClient = (apiKey: string): AirtopClient => {
  if (!clientsMap.has(apiKey)) {
    clientsMap.set(
      apiKey,
      new AirtopClient({
        apiKey,
      }),
    );
  }
  return clientsMap.get(apiKey)!;
};

// Optional: Cleanup function to remove unused clients
export const removeAirtopClient = (apiKey: string): void => {
  clientsMap.delete(apiKey);
};
