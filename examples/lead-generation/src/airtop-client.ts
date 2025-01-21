import { AirtopClient } from "@airtop/sdk";

let airtopClientInstance: AirtopClient | null = null;

/**
 * Get an AirtopClient instance using the singleton pattern.
 * 🔥 NOTE: This pattern only allows one instance with one API key.
 * @param apiKey - The API key for the AirtopClient.
 * @returns An instance of AirtopClient.
 */
export const getAirtopClient = (apiKey: string): AirtopClient => {
  if (!airtopClientInstance) {
    airtopClientInstance = new AirtopClient({
      apiKey,
    });
  }
  return airtopClientInstance;
};
