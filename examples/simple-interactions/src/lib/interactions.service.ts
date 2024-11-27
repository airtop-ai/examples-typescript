import {
  ANIMATION_DELAY,
  DEFAULT_STOCK_SYMBOL,
  INITIAL_URL,
  STOCK_PERFORMANCE_OUTPUT_SCHEMA,
  STOCK_PERFORMANCE_PROMPT,
  sleep,
} from "@/consts";
import { AirtopClient } from "@airtop/sdk";
import type { LogLayer } from "loglayer";

/**
 * Service for interacting with Google Finance data using the Airtop client.
 */
export class InteractionsService {
  client: AirtopClient;
  log: LogLayer;
  ticker: string;

  /**
   * Creates a new instance of InteractionsService.
   * @param {Object} params - Configuration parameters
   * @param {string} params.apiKey - API key for Airtop client authentication
   * @param {LogLayer} params.log - Logger instance for service operations
   * @param {string} params.ticker - The ticker symbol of the stock or asset to search for
   */
  constructor({
    apiKey,
    log,
    ticker,
  }: {
    apiKey: string;
    log: LogLayer;
    ticker?: string;
  }) {
    this.client = new AirtopClient({
      apiKey,
    });
    this.log = log;
    this.ticker = ticker || DEFAULT_STOCK_SYMBOL;
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    this.log.info("Terminating session");
    await this.client.sessions.terminate(sessionId);
  }

  /**
   * Initializes a new browser session and window.
   * @returns {Promise<{session: any, windowInfo: any}>} Session and window information
   */
  async initializeSessionAndBrowser(): Promise<{ session: any; windowInfo: any }> {
    this.log.info("Creating a new session");
    const createSessionResponse = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 10,
      },
    });

    const session = createSessionResponse.data;
    this.log.info("Created session", session.id);

    if (!createSessionResponse.data.cdpWsUrl) {
      throw new Error("Unable to get cdp url");
    }

    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(session.id, { url: INITIAL_URL });

    this.log.info("Getting browser window info");
    const windowInfo = await this.client.windows.getWindowInfo(session.id, windowResponse.data.windowId);

    return {
      session,
      windowInfo,
    };
  }

  /**
   * Checks if the user is currently signed into LinkedIn.
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<boolean>} Whether the user is logged in
   */
  async searchForStockPerformance({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<void> {
    this.log.info(`Searching for ${this.ticker}`);

    await this.client.windows.type(sessionId, windowId, {
      elementDescription: "The search box",
      text: this.ticker,
      pressEnterKey: true,
    });

    // Wait for the search results to load
    await sleep(ANIMATION_DELAY);
  }

  async clickOnStockPerformanceChart({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<void> {
    this.log.info("Clicking on the stock performance chart for the past 6 months");
    await this.client.windows.click(sessionId, windowId, {
      elementDescription: "The '6M' button at the top of the chart",
    });

    // Wait for the chart to load
    await sleep(ANIMATION_DELAY);
  }

  /**
   * Extracts data from LinkedIn by navigating to the target URL and querying the page.
   * @param {Object} params - Parameters for data extraction
   * @param {string} params.sessionId - Active session ID
   * @param {string} params.windowId - Active window ID
   * @returns {Promise<string>} Formatted JSON string containing extracted data
   */
  async extractStockPerformanceData({ sessionId, windowId }: { sessionId: string; windowId: string }): Promise<string> {
    this.log.info("Extracting data from Google Finance");

    this.log.info("Prompting the AI agent, waiting for a response (this may take a few minutes)...");

    const pageQueryResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: STOCK_PERFORMANCE_PROMPT(this.ticker),
      configuration: {
        outputSchema: STOCK_PERFORMANCE_OUTPUT_SCHEMA(this.ticker),
      },
    });

    this.log.info("Got response from AI agent, formatting JSON");

    const formattedJson = JSON.stringify(JSON.parse(pageQueryResponse.data.modelResponse), null, 2);

    return formattedJson;
  }
}
