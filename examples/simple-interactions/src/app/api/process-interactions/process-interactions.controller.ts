import type { ProcessInteractionsResponse } from "@/app/api/process-interactions/process-interactions.validation";
import { InteractionsService } from "@/lib/interactions.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the process interactions controller
 * @interface ProcessInteractionsControllerParams
 * @property {string} apiKey - API key for Airtop authentication
 * @property {string} [profileId] - Optional profile ID for session management
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface ProcessInteractionsControllerParams {
  apiKey: string;
  sessionId: string;
  windowId: string;
  ticker?: string;
  log: LogLayer;
}

/**
 * Controls the execution of interactions with the browser
 * @param {ProcessInteractionsControllerParams} params - Configuration parameters
 * @returns {Promise<ProcessInteractionsResponse>} Response containing session info or extracted content
 */
export async function processInteractionsController({
  apiKey,
  sessionId,
  windowId,
  ticker,
  log,
}: ProcessInteractionsControllerParams): Promise<ProcessInteractionsResponse> {
  // Initialize the interactions service
  const service = new InteractionsService({ apiKey, log, ticker });

  log.info("Searching for stock performance");
  await service.searchForStockPerformance({
    sessionId,
    windowId,
  });

  await service.clickOnStockPerformanceChart({
    sessionId,
    windowId,
  });

  const content = await service.extractStockPerformanceData({
    sessionId,
    windowId,
  });

  // Return the extracted content
  return {
    content,
  };
}
