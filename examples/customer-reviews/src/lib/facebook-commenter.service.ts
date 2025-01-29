import {
  EXTRACT_REVIEW_OUTPUT_SCHEMA,
  EXTRACT_REVIEW_PROMPT,
  IS_LOGGED_IN_OUTPUT_SCHEMA,
  IS_LOGGED_IN_PROMPT,
  LOGIN_URL,
  TARGET_URL,
  type TReviewOutput,
} from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import type { Issue } from "@airtop/sdk/api";
import type { LogLayer } from "loglayer";
import puppeteer from "puppeteer-core";

/**
 * Service for interacting with customer reviews
 */
export class FacebookCommenterService {
  client: AirtopClient;
  log: LogLayer;

  /**
   * Create a new instance of FacebookCommenterService.
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
   * Initialize a new browser session and window.
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
    this.log.info("Created session: ", session.id);

    if (!session.cdpWsUrl) {
      throw new Error("Unable to get cdp url");
    }

    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(session.id, { url: LOGIN_URL });

    this.log.info("Getting browser window info");
    const windowInfo = await this.client.windows.getWindowInfo(session.id, windowResponse.data.windowId);

    return {
      session,
      windowInfo: {
        ...windowInfo,
        targetId: windowResponse.data.targetId,
      },
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
   * Connect to Puppeter and scroll down the page
   * @param {Object} params - Session parameters
   * @param {string} params.apiKey - API key for Airtop client authentication
   * @param {string} params.targetId - The taregt ID to identify the page
   * @param {string} params.cdpWsUrl - The URL to connect puppeter
   * @returns {Promise<void>} void
   */
  async scrollDown({
    apiKey,
    targetId,
    cdpWsUrl,
  }: { targetId: string; cdpWsUrl: string; apiKey: string }): Promise<void> {
    this.log.info("Connecting puppeteer with the session");
    const puppeteerBrowser = await puppeteer.connect({
      browserWSEndpoint: cdpWsUrl,
      headers: {
        authorization: `Bearer ${apiKey}`,
      },
    });

    // Iterate through the pages to find the one that matches the target ID
    const pages = await puppeteerBrowser.pages();
    let matchingPage;
    for (const page of pages) {
      const pageTargetId = await (page.mainFrame() as any)._id;
      if (pageTargetId === targetId) {
        matchingPage = page;
        break;
      }
    }

    if (!matchingPage) {
      throw new Error("Unable to find page");
    }

    this.log.info("Scrolling down to reviews...");
    await matchingPage.setViewport({
      width: 1200,
      height: 1200,
    });
    await matchingPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Check if the user is currently signed into the target website.
   * @param {Object} params - Parameters for checking login status
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<boolean>} Whether the user is logged in
   */
  async checkIfSignedIntoWebsite({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<boolean> {
    this.log.info("Determining whether the user is logged in...");
    const isLoggedInPromptResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    this.log.info("Parsing response to client if the user is logged in");
    const parsedResponse = JSON.parse(isLoggedInPromptResponse.data.modelResponse);

    if (parsedResponse.error) {
      throw new Error(parsedResponse.error);
    }

    return parsedResponse.isLoggedIn;
  }

  /**
   * Find the first customer's review that has no reply
   * @param {Object} params - Session parameters
   * @param {string} params.sessionId - Session's ID
   * @param {string} params.windowId - Window ID
   * @returns {Promise<TReviewOutput>} Extracted review
   */
  async extractCustomerReview({
    sessionId,
    windowId,
  }: { sessionId: string; windowId: string }): Promise<TReviewOutput> {
    this.log.info("Getting customer review");
    // Navigate to the target URL
    this.log.info("Navigating to target url");

    await this.client.windows.loadUrl(sessionId, windowId, { url: TARGET_URL });

    this.log.info("Prompting the AI agent, waiting for a response (this might take a few minutes)...");

    const promptContentResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: EXTRACT_REVIEW_PROMPT,
      followPaginationLinks: false, // Unnecessary for this demo
      configuration: {
        outputSchema: EXTRACT_REVIEW_OUTPUT_SCHEMA,
      },
    });

    this.log.info("Got response from AI agent, formatting JSON");
    const result = JSON.parse(promptContentResponse.data.modelResponse) as TReviewOutput;
    return result;
  }

  /**
   * Execute micro-interactions to reply to the customer
   * @param {Object} params - Session parameters
   * @param {string} params.sessionId - Session's ID
   * @param {string} params.windowId - Window ID
   * @param {Object} params.review - Extracted review
   * @returns {Promise} List of interaction errors or empty when no errors happened
   */
  async replyToCustomer({
    sessionId,
    windowId,
    review,
  }: { sessionId: string; windowId: string; review: TReviewOutput }): Promise<{ errors: Issue[] }> {
    const beginOfComment = review.text.substring(0, 18); // this helps to identify the review

    // Like the comment if the review is positive
    if (review.sentiment === "positive") {
      this.log.info("Clicking Like button...");
      await this.client.windows.click(sessionId, windowId, {
        elementDescription: `The "Like" button near the comment that begins with "${beginOfComment}..."`,
      });
    }

    this.log.info("Replying to customer...");
    const result = await this.client.windows.type(sessionId, windowId, {
      elementDescription: `The input field that says "Comment as..." for the comment "${beginOfComment}..."`,
      text: review.reply,
      pressEnterKey: true, // Press Enter after typing
    });

    return {
      errors: result.errors || [],
    };
  }
}
