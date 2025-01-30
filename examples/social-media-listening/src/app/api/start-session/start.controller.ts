import type { StartSessionResponse } from "@/app/api/start-session/start.validation";
import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the start controller
 * @interface StartControllerParams
 * @property {string} apiKey - API key for Airtop authentication
 * @property {string} profileName - Profile name to use for the session
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface StartControllerParams {
  apiKey: string;
  profileName?: string;
  log: LogLayer;
}

/**
 * Controls the initialization and execution of interactions with the browser
 * @param {StartControllerParams} params - Configuration parameters
 * @returns {Promise<StartSessionResponse>} Response containing session info or extracted content
 */
export async function startController({
  apiKey,
  profileName,
  log,
}: StartControllerParams): Promise<StartSessionResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log });

  // Start a new browser session and get window information
  const sessionContext = await service.initializeSessionAndBrowser(profileName);

  if (profileName) {
    await service.saveProfileOnTermination(sessionContext.session.id, profileName);
  }

  // Return the session data
  return sessionContext;
}
