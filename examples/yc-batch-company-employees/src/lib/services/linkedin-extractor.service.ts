import { IS_LOGGED_IN_OUTPUT_SCHEMA, IS_LOGGED_IN_PROMPT, type IsLoggedInResponse, LINKEDIN_FEED_URL } from "@/consts";
import type { AirtopService } from "@/lib/services/airtop.service";
import type { BatchOperationError, BatchOperationInput, BatchOperationUrl } from "@airtop/sdk";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting data from LinkedIn.
 */
export class LinkedInExtractorService {
  log: LogLayer;
  airtop: AirtopService;

  /**
   * Creates a new instance of LinkedInExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {AirtopService} params.airtop - Airtop client
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ airtop, log }: { airtop: AirtopService; log: LogLayer }) {
    this.airtop = airtop;
    this.log = log;
  }

  /**
   * Extracts the LinkedIn employees search URL from the given text
   * @param text - The text to extract the LinkedIn employees search URL from
   * @returns The LinkedIn employees search URL or null if not found
   */
  extractEmployeeListUrl(text: string): string | null {
    // Pattern to match LinkedIn employees search URLs
    const pattern = /https:\/\/www\.linkedin\.com\/search\/results\/people\/\?[^"\s]*/g;

    // Find all search URLs
    const matches = text.match(pattern);

    // Filter to only include URLs with currentCompany parameter
    const employeesUrl = matches?.find((url) => url.includes("currentCompany="));

    return employeesUrl || null;
  }

  /**
   * Extracts the LinkedIn employees list URLs from the given text
   * @param text - The text to extract the LinkedIn employees list URLs from
   * @returns The list of LinkedIn employees list URLs
   */
  extractEmployeeProfileUrls(text: string): string[] {
    // Pattern to match LinkedIn profile URLs that appear after navigationUrl
    const pattern = /"navigationUrl":"(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\?[^"]*)?)/g;

    // Find all matches and extract just the URL part
    const matches = [...text.matchAll(pattern)].map((match) => match[1]);

    // Remove any query parameters to get clean profile URLs
    const cleanUrls = matches.map((url) => url?.split("?")[0]).filter(Boolean) as string[];

    // Remove duplicates
    return [...new Set(cleanUrls)];
  }

  /**
   * Checks if the user is signed into LinkedIn
   * @param sessionId - The ID of the session
   * @returns Whether the user is signed into LinkedIn
   */
  async checkIfSignedIntoLinkedIn(sessionId: string): Promise<boolean> {
    this.log.info("Checking if user is signed into LinkedIn");
    const window = await this.airtop.createWindow(sessionId, LINKEDIN_FEED_URL);

    const modelResponse = await this.airtop.client.windows.pageQuery(sessionId, window.data.windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No response from LinkedIn");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as IsLoggedInResponse;

    return response.isLoggedIn;
  }

  /**
   * Gets the LinkedIn employees list URLs for a given set of companies
   * @param companyLinkedInProfileUrls - The list of company LinkedIn profile URLs
   * @param sessionId - The ID of the session
   * @param parallelism - The number of parallel requests to make
   * @returns The list of LinkedIn employees list URLs
   */
  async getEmployeesListUrls({
    companyLinkedInProfileUrls,
    profileId,
  }: {
    companyLinkedInProfileUrls: BatchOperationUrl[];
    profileId: string;
  }): Promise<BatchOperationUrl[]> {
    this.log
      .info("Attempting to get the list of employees for the companies");

    const employeesListUrls: string[] = [];
    const getEmployeesListUrl = async (input: BatchOperationInput) => {
      
      const scrapedContent = await this.airtop.client.windows.scrapeContent(
        input.sessionId,
        input.windowId,
      );

      const url = this.extractEmployeeListUrl(scrapedContent.data.modelResponse.scrapedContent.text);

      if (!url) {
        throw new Error("No employees list URL found");
      }

      employeesListUrls.push(url);

      this.log
      .withMetadata({
        employeesListUrls,
      })
      .info("Successfully fetched employee list URLs for the companies");

      return {};
    };

    const handleError = async ({ error, operationUrls }: BatchOperationError) => {
      this.log
        .withError(error)
        .withMetadata({
          operationUrls,
        })
        .error("Error extracting employees list URL for company LinkedIn profile");
    };

    await this.airtop.client.batchOperate(companyLinkedInProfileUrls, getEmployeesListUrl, {
      onError: handleError,
      sessionConfig: {
        baseProfileId: profileId,
      },
    });


    // Filter out any null values and remove duplicates
    return [...new Set(employeesListUrls.filter((url) => url !== null).map((url) => ({ url })))];
  }

  /**
   * Gets the LinkedIn employees profile URLs for a list of LinkedIn employees list URLs
   * @param employeesListUrls - The list of LinkedIn employees list URLs
   * @param sessionId - The ID of the session
   * @param parallelism - The number of parallel requests to make
   * @returns The list of LinkedIn employees profile URLs
   */
  async getEmployeesProfileUrls({
    employeesListUrls,
    profileId,
  }: { employeesListUrls: BatchOperationUrl[]; profileId: string }): Promise<string[]> {
    this.log.info("Initiating extraction of employee's profile URLs for the employees");

    const employeesProfileUrls: string[] = [];
    const getEmployeeProfileUrl = async (input: BatchOperationInput) => {
      this.log.info(`Scraping content for employee URL: ${input.operationUrl.url}`);
      const scrapedContent = await this.airtop.client.windows.scrapeContent(input.sessionId, input.windowId);

      const newUrls = this.extractEmployeeProfileUrls(scrapedContent.data.modelResponse.scrapedContent.text);
      employeesProfileUrls.push(...newUrls);

      return {};
    };

    await this.airtop.client.batchOperate(employeesListUrls, getEmployeeProfileUrl, {
      sessionConfig: {
        baseProfileId: profileId,
      },
    });

    this.log
      .withMetadata({
        employeesProfileUrls,
      })
      .info("Successfully obtained employee profile URLs");

    return employeesProfileUrls;
  }

  /**
   * Gets the LinkedIn login page Live View URL
   * @param sessionId - The ID of the session
   * @returns The LinkedIn login page Live View URL
   */
  async getLinkedInLoginPageLiveViewUrl(sessionId: string): Promise<string> {
    const linkedInWindow = await this.airtop.createWindow(sessionId, LINKEDIN_FEED_URL);

    const windowInfo = await this.airtop.client.windows.getWindowInfo(sessionId, linkedInWindow.data.windowId);

    return windowInfo.data.liveViewUrl;
  }
}
