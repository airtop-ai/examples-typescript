import type { StartResponse } from "@/app/api/start/start.validation";
import { FacebookCommenterService } from "@/lib/facebook-commenter.service";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the start controller
 * @interface StartControllerParams
 * @property {string} apiKey - API key for Airtop SDK
 * @property {string} [profileName] - Optional profile name for session management
 * @property {LogLayer} log - Logger instance for tracking operations
 */
interface StartControllerParams {
  apiKey: string;
  profileName?: string;
  log: LogLayer;
}

/**
 * Controls the initialization and execution of the task
 * @param {StartControllerParams} params - Configuration parameters
 * @returns {Promise<StartResponse>} Response containing session info or extracted content
 */
export async function startController({ apiKey, profileName, log }: StartControllerParams): Promise<StartResponse> {
  // Initialize the service
  const service = new FacebookCommenterService({ apiKey, log });

  // Start a new browser session and get window information
  const { session, windowInfo } = await service.initializeSessionAndBrowser(profileName);

  // Save profile on termination
  if (profileName) {
    await service.saveProfileOnTermination(session.id, profileName);
  }

  // Check if the browser (client) is already authenticated in Facebook
  const isSignedIn = await service.checkIfSignedIntoWebsite({
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
  });

  if (!isSignedIn) {
    log.info(
      "Sign-in to Facebook is required, returning results with URL to live view",
      chalk.blueBright(windowInfo.data.liveViewUrl),
    );
  }

  return {
    sessionId: session.id,
    windowId: windowInfo.data.windowId,
    profileName,
    liveViewUrl: windowInfo.data.liveViewUrl,
    targetId: windowInfo.targetId as string,
    cdpWsUrl: session.cdpWsUrl,
    signInRequired: !isSignedIn,
  };

  // // Reply to customer and return execution information
  // const content = await service.extractCustomerReview({
  //   sessionId: session.id,
  //   windowId: windowInfo.data.windowId,
  // });

  // // Return the result
  // return {
  //   signInRequired: false,
  //   content,
  // };
}
