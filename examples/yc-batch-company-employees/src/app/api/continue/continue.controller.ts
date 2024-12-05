import type { ContinueResponse } from "@/app/api/continue/continue.validation";
import { getServices } from "@/lib/services";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the continue controller
 * @interface ContinueControllerParams
 * @property {string} apiKey - API key for authentication
 * @property {string} sessionId - Unique identifier for the current session
 * @property {LogLayer} log - Logging utility instance
 */
interface ContinueControllerParams {
  apiKey: string;
  sessionId: string;
  log: LogLayer;
}

/**
 * Controller to handle continuation of LinkedIn Login - fetching batches
 * @param {ContinueControllerParams} params - The parameters needed for extraction
 * @returns {Promise<ContinueResponse>} The extracted YC batches
 */
export async function continueController({
  apiKey,
  log,
  sessionId,
}: ContinueControllerParams): Promise<ContinueResponse> {
  // Initialize the yCombinator extractor service with API key and logging
  const { yCombinator, airtop } = getServices(apiKey, log);

  try {
    // Fetch YC batches
    const batches = await yCombinator.getYcBatches(sessionId);

    return {
      sessionId,
      batches: batches,
    };
  } catch (error) {
    await airtop.terminateSession(sessionId);
    throw error;
  }
}
