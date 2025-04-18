import { openai } from "@ai-sdk/openai";
import { AirtopClient } from "@airtop/sdk";
import type { ExternalSessionWithConnectionInfo, WindowResponse } from "@airtop/sdk/api";
import { type StepResult, generateText, tool } from "ai";
import type { LogLayer } from "loglayer";
import { z } from "zod";

const GOAL = `Extract the current price of NVDA and the growth percentage over all the time periods available. 
There may be buttons on the page to access historical information.
Use Google Finance to access stock data at https://www.google.com/finance/quote/NVDA:NASDAQ`;

/**
 * Service for running a financial analysis agent using Airtop and OpenAI.
 */
export class FinancialAnalysisService {
  client: AirtopClient;
  sessionId?: string;
  windowId?: string;
  log: LogLayer;
  /**
   * Creates a new instance of FinancialAnalysisService.
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

  async initializeSessionAndBrowser(): Promise<{
    session: ExternalSessionWithConnectionInfo;
    windowInfo: WindowResponse;
  }> {
    this.log.info("Creating a new session");
    const createSessionResponse = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 10,
      },
    });

    const session = createSessionResponse.data;
    this.log.info("Created session", session.id);

    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(session.id);

    this.log.info("Getting browser window info");
    const windowInfo = await this.client.windows.getWindowInfo(session.id, windowResponse.data.windowId);

    return {
      session,
      windowInfo,
    };
  }

  /**
   * Sends a prompt to the OpenAI API and returns the result.
   * @param {string} params.goal - The goal of the analysis
   * @returns {Promise<{ text: string, steps: StepResult<any>[] }>} The result of the analysis
   */
  private async sendPrompt({ goal }: { goal: string }): Promise<{ text: string; steps: StepResult<any>[] }> {
    const { text, steps } = await generateText({
      model: openai("gpt-4o"),
      onStepFinish: ({ text, toolResults, finishReason }) => {
        this.log.info(`Step finished: ${text}`);
        this.log.info(`Tool results: ${JSON.stringify(toolResults, null, 2)}`);
        this.log.info(`Finish reason: ${finishReason}`);
      },
      tools: {
        // Tool to load a URL
        loadUrl: tool({
          description: "Load a URL",
          parameters: z.object({
            url: z.string().describe("The URL to load"),
          }),
          execute: async ({ url }) => {
            this.log.info(`Loading URL: ${url}`);
            if (!this.sessionId || !this.windowId) {
              throw new Error("Session or window ID not found");
            }

            await this.client.windows.loadUrl(this.sessionId, this.windowId, { url });
            return {
              data: "URL loaded",
            };
          },
        }),
        // Tool to extract data from the page given a natural language query/prompt
        extractData: tool({
          description: "Extract data from the page given a natural language query/prompt",
          parameters: z.object({
            prompt: z.string().describe("The natural language query/prompt to extract data from the page"),
          }),
          execute: async ({ prompt }) => {
            this.log.info(`Extracting data from the page with prompt: ${prompt}`);
            if (!this.sessionId || !this.windowId) {
              throw new Error("Session or window ID not found");
            }

            const result = await this.client.windows.pageQuery(this.sessionId, this.windowId, { prompt });
            return {
              data: result.data.modelResponse,
            };
          },
        }),
        // Tool to click an element on the page
        clickButton: tool({
          description: "Click an element on the page",
          parameters: z.object({
            elementDescription: z.string().describe("The description of the element to click"),
          }),
          execute: async ({ elementDescription }) => {
            this.log.info(`Clicking element on the page with description: ${elementDescription}`);
            if (!this.sessionId || !this.windowId) {
              throw new Error("Session or window ID not found");
            }

            const result = await this.client.windows.click(this.sessionId, this.windowId, { elementDescription });
            return {
              data: result.data.modelResponse,
            };
          },
        }),
      },
      maxSteps: 20, // allow up to 20 steps
      prompt: `
      You are a financial analyst. You are given a goal and a set of tools to use to achieve the goal.
      You will use the tools to achieve the goal.
      You will return the result of the goal and the steps you took to achieve it.
      You may only load one URL at a time, and you may only click one element at a time.
      
      When accessing historical information:
      1. Click on ONE time period button (e.g., "1D" or "5D")
      2. IMMEDIATELY after clicking, extract the data for that time period
      3. Move on to the next time period and repeat the process if necessary
      
      Do not click multiple buttons in sequence without extracting data between clicks.
      Each historical data point should follow this strict pattern:
      - Click time period button
      - Extract data
      - Move to next time period

      Goal: ${goal}
      `,
    });

    return {
      text,
      steps,
    };
  }

  /**
   * Performs a financial analysis.
   * @param {string} sessionId - The ID of the session
   * @param {string} windowId - The ID of the window
   * @returns {Promise<string>} The result of the analysis
   */
  async performAnalysis(sessionId: string, windowId: string): Promise<string> {
    this.sessionId = sessionId;
    this.windowId = windowId;

    const { text } = await this.sendPrompt({ goal: GOAL });
    return text;
  }
}
