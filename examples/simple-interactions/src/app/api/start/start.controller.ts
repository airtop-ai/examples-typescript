import type { StartResponse } from "@/app/api/start/start.validation";
import { InteractionsService } from "@/lib/interactions.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the start controller
 * @interface StartControllerParams
 * @property {string} apiKey - API key for Airtop authentication
 * @property {string} [profileId] - Optional profile ID for session management
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

/**
 * Controls the initialization and execution of interactions with the browser
 * @param {StartControllerParams} params - Configuration parameters
 * @returns {Promise<StartResponse>} Response containing session info or extracted content
 */
export async function startController({ apiKey, profileId, log }: StartControllerParams): Promise<StartResponse> {
  // Initialize the interactions service
  const service = new InteractionsService({ apiKey, log });

  // Start a new browser session and get window information
  const { session, windowInfo } = await service.initializeSessionAndBrowser(profileId);

  // Return the extracted content
  return {
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
    profileId: session.profileId,
    liveViewUrl: windowInfo.data.liveViewUrl,
  };
}
