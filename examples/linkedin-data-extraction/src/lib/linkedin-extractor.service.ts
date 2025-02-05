import {
  EXTRACT_DATA_OUTPUT_SCHEMA,
  EXTRACT_DATA_PROMPT,
  IS_LOGGED_IN_OUTPUT_SCHEMA,
  IS_LOGGED_IN_PROMPT,
  LOGIN_URL,
  TARGET_URL,
} from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting LinkedIn data using the Airtop client.
 */
export class LinkedInExtractorService {
  client: AirtopClient;
  log: LogLayer;

  /**
   * Creates a new instance of LinkedInExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {string} params.apiKey - API key for Airtop client authentication
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({
    apiKey,
    log,
  }: {
    apiKey: string;
    log: LogLayer;
  }) {
    this.client = new AirtopClient({
      apiKey,
    });
    this.log = log;
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    await this.client.sessions.terminate(sessionId);
  }

  /**
   * Initializes a new browser session and window.
   * @param {string} [profileName] - Optional profile name for session persistence
   * @returns {Promise<{session: any, windowInfo: any}>} Session and window information
   */
  async initializeSessionAndBrowser(profileName?: string): Promise<{ session: any; windowInfo: any }> {
    this.log.info("Creating a new session");
    const createSessionResponse = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 10,
        profileName,
      },
    });

    const session = createSessionResponse.data;
    this.log.info("Created session", session.id);

    if (!createSessionResponse.data.cdpWsUrl) {
      throw new Error("Unable to get cdp url");
    }

    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(session.id, { url: LOGIN_URL });

    this.log.info("Getting browser window info");
    const windowInfo = await this.client.windows.getWindowInfo(session.id, windowResponse.data.windowId);

    return {
      session,
      windowInfo,
    };
  }

  /**
   * Saves changes made to the browsing profile on session termination.
   * @param {string} sessionId - The ID of the session to save the profile on
   * @param {string} profileName - The name of the profile to save
   */
  async saveProfileOnTermination(sessionId: string, profileName: string): Promise<void> {
    this.log.info(`Profile "${profileName}" will be saved on session termination.`);
    await this.client.sessions.saveProfileOnTermination(sessionId, profileName);
  }

  /**
   * Checks if the user is currently signed into LinkedIn.
   * @param {Object} params - Parameters for checking login status
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<boolean>} Whether the user is logged in
   */
  async checkIfSignedIntoLinkedIn({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<boolean> {
    this.log.info("Determining whether the user is logged in...");
    const isLoggedInPromptResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    this.log.info("Parsing response to if the user is logged in");
    const parsedResponse = JSON.parse(isLoggedInPromptResponse.data.modelResponse);

    if (parsedResponse.error) {
      throw new Error(parsedResponse.error);
    }

    return parsedResponse.isLoggedIn;
  }

  /**
   * Extracts data from LinkedIn by navigating to the target URL and querying the page.
   * @param {Object} params - Parameters for data extraction
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<string>} Formatted JSON string containing extracted data
   */
  async extractLinkedInData({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<string> {
    this.log.info("Extracting data from LinkedIn");

    // Navigate to the target URL
    this.log.info("Navigating to target url");

    await this.client.windows.loadUrl(sessionId, windowId, { url: TARGET_URL });

    this.log.info("Prompting the AI agent, waiting for a response (this may take a few minutes)...");

    const promptContentResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: EXTRACT_DATA_PROMPT,
      configuration: {
        outputSchema: EXTRACT_DATA_OUTPUT_SCHEMA,
      },
    });

    this.log.info("Got response from AI agent, formatting JSON");

    const formattedJson = JSON.stringify(JSON.parse(promptContentResponse.data.modelResponse), null, 2);

    this.log.info("Closing window and terminating session");

    await this.client.windows.close(sessionId, windowId);
    await this.client.sessions.terminate(sessionId);

    this.log.info("Cleanup completed");

    return formattedJson;
  }
}
