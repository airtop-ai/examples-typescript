import {
  type Company,
  GET_COMPANIES_IN_BATCH_OUTPUT_SCHEMA,
  GET_COMPANIES_IN_BATCH_PROMPT,
  GET_COMPANY_LINKEDIN_PROFILE_URL_OUTPUT_SCHEMA,
  GET_COMPANY_LINKEDIN_PROFILE_URL_PROMPT,
  GET_YC_BATCHES_OUTPUT_SCHEMA,
  GET_YC_BATCHES_PROMPT,
  type GetCompaniesInBatchResponse,
  type GetCompanyLinkedInProfileUrlResponse,
  type GetYcBatchesResponse,
  YC_COMPANIES_URL,
} from "@/consts";
import type { AirtopService } from "@/lib/services/airtop.service";
import type { BatchOperationError, BatchOperationInput, BatchOperationUrl } from "@airtop/sdk";
import type { LogLayer } from "loglayer";

/**
 * Service for extracting data from Y Combinator.
 */
export class YCExtractorService {
  airtop: AirtopService;
  log: LogLayer;

  /**
   * Creates a new instance of YCExtractorService.
   * @param {Object} params - Configuration parameters
   * @param {AirtopService} params.airtop - Airtop client
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ airtop, log }: { airtop: AirtopService; log: LogLayer }) {
    this.airtop = airtop;
    this.log = log;
  }

  /**
   * Gets the Y Combinator batches from the Y Combinator Company Directory page.
   * @returns {Promise<string[]>} A promise that resolves to an array of batches
   */
  async getYcBatches(sessionId?: string): Promise<string[]> {
    this.log.info("Initiating fetch to get YC batches");

    // Get session info if provided, otherwise create a new session
    const session = sessionId
      ? await this.airtop.client.sessions.getInfo(sessionId)
      : await this.airtop.createSession();

    // YC Company Directory window
    const window = await this.airtop.client.windows.create(session.data.id, {
      url: YC_COMPANIES_URL,
    });

    this.log.info("Extracting YC batches");
    // Extract the batches from the YC Company Directory page
    const modelResponse = await this.airtop.client.windows.pageQuery(session.data.id, window.data.windowId, {
      prompt: GET_YC_BATCHES_PROMPT,
      configuration: {
        outputSchema: GET_YC_BATCHES_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No batches found");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as GetYcBatchesResponse;

    if (response.error) {
      throw new Error(response.error);
    }

    this.log
      .withMetadata({
        batches: response.batches,
      })
      .info("Successfully fetched YC batches");

    return response.batches;
  }

  /**
   * Gets the companies in a given Y Combinator batch.
   * @param {string} batch - The batch to get companies for
   * @param {string} sessionId - The ID of the session
   * @returns {Promise<string[]>} A promise that resolves to an array of company names
   */
  async getCompaniesInBatch(batch: string, sessionId?: string): Promise<Company[]> {
    this.log.info(`Initiating fetch to get companies in Y Combinator batch "${batch}"`);

    const session = sessionId
      ? await this.airtop.client.sessions.getInfo(sessionId)
      : await this.airtop.createSession();

    // YC Company Directory window
    const window = await this.airtop.client.windows.create(session.data.id, {
      url: `${YC_COMPANIES_URL}?batch=${batch}`,
    });

    this.log.info(`Extracting companies in batch "${batch}"`);
    const modelResponse = await this.airtop.client.windows.pageQuery(session.data.id, window.data.windowId, {
      prompt: GET_COMPANIES_IN_BATCH_PROMPT,
      configuration: {
        outputSchema: GET_COMPANIES_IN_BATCH_OUTPUT_SCHEMA,
      },
    });

    if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
      throw new Error("No companies found");
    }

    const response = JSON.parse(modelResponse.data.modelResponse) as GetCompaniesInBatchResponse;

    if (response.error) {
      throw new Error(response.error);
    }

    this.log
      .withMetadata({
        companies: response.companies,
      })
      .info("Successfully fetched companies in batch");

    return response.companies;
  }

  /**
   * Gets the LinkedIn profile URLs for a list of companies.
   * @param {Company[]} companies - The companies to get LinkedIn profile URLs for
   * @returns {Promise<string[]>} A promise that resolves to an array of LinkedIn profile URLs
   */
  async getCompaniesLinkedInProfileUrls(companies: Company[]): Promise<BatchOperationUrl[]> {
    const companyUrls: BatchOperationUrl[] = companies.map((c) => ({ url: c.link }));

    const profileUrls: BatchOperationUrl[] = [];
    const getProfileUrl = async (input: BatchOperationInput) => {
      this.log.info(`Scraping for LinkedIn profile URL ${input.operationUrl.url}`);
      const modelResponse = await this.airtop.client.windows.pageQuery(input.sessionId, input.windowId, {
        prompt: GET_COMPANY_LINKEDIN_PROFILE_URL_PROMPT,
        configuration: {
          outputSchema: GET_COMPANY_LINKEDIN_PROFILE_URL_OUTPUT_SCHEMA,
        },
      });

      if (!modelResponse.data.modelResponse || modelResponse.data.modelResponse === "") {
        throw new Error("No LinkedIn profile URL found");
      }

      const response = JSON.parse(modelResponse.data.modelResponse) as GetCompanyLinkedInProfileUrlResponse;

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.linkedInProfileUrl) {
        throw new Error("Failed to parse LinkedIn profile URL");
      }
      
      profileUrls.push({ url: response.linkedInProfileUrl });
      return {};
    };

    const handleError = async ({error, operationUrls}: BatchOperationError) => {
      this.log.withError(error).withMetadata({ operationUrls }).error("Error extracting LinkedIn profile URL");
    };

    this.log.info("Getting LinkedIn profile URLs for companies");
    await this.airtop.client.batchOperate(companyUrls, getProfileUrl, { onError: handleError });

    this.log
      .withMetadata({
        linkedInProfileUrls: companyUrls,
      })
      .info("Successfully fetched LinkedIn profile urls for the companies");

    return profileUrls.filter((url) => url.url !== null);
  }
}
