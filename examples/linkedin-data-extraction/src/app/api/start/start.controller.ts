import type { StartResponse } from "@/app/api/start/start.validation";
import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the start controller
 * @interface StartControllerParams
 * @property {string} apiKey - API key for LinkedIn authentication
 * @property {string} [profileName] - Optional profile name for session management
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface StartControllerParams {
  apiKey: string;
  profileName?: string;
  log: LogLayer;
}

/**
 * Controls the initialization and execution of LinkedIn data extraction
 * @param {StartControllerParams} params - Configuration parameters
 * @returns {Promise<StartResponse>} Response containing session info or extracted content
 */
export async function startController({ apiKey, profileName, log }: StartControllerParams): Promise<StartResponse> {
  // Initialize the LinkedIn extractor service
  const service = new LinkedInExtractorService({ apiKey, log });

  // Start a new browser session and get window information
  const { session, windowInfo } = await service.initializeSessionAndBrowser(profileName);

  // Save profile on termination
  if (profileName) {
    await service.saveProfileOnTermination(session.id, profileName);
  }

  // Check if the user is already authenticated with LinkedIn
  const isSignedIn = await service.checkIfSignedIntoLinkedIn({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  // If not signed in, return the live view URL for manual authentication
  if (!isSignedIn) {
    log.info(
      "Sign-in to Linkedin is required, returning results with URL to live view",
      chalk.blueBright(windowInfo.data.liveViewUrl),
    );

    return {
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
      profileName,
      liveViewUrl: windowInfo.data.liveViewUrl,
      signInRequired: true,
    };
  }

  // Extract LinkedIn data using the authenticated session
  const content = await service.extractLinkedInData({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  // Return the extracted content
  return {
    signInRequired: false,
    profileName,
    content,
  };
}
