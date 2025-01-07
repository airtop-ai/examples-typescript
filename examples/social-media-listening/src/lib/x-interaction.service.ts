import {
  EXTRACTED_POST_OUTPUT_SCHEMA,
  EXTRACT_POSTS_PROMPT,
  GENERATED_REPLY_OUTPUT_SCHEMA,
  GENERATE_REPLY_PROMPT,
  INITIAL_URL,
  IS_LOGGED_IN_OUTPUT_SCHEMA,
  IS_LOGGED_IN_PROMPT,
  SCREEN_RESOLUTION,
  type TExtractedPostResult,
  type TGeneratedReplyResult,
  type TIsLoggedInResult,
  type TPost,
} from "@/consts";
import { sleep, trimPrompt } from "@/utils";
import { AirtopClient } from "@airtop/sdk";
import type { SessionResponse, WindowResponse } from "@airtop/sdk/api";
import chalk from "chalk";
import type { LogLayer } from "loglayer";

interface XInteractionServiceConfig {
  apiKey: string;
  log: LogLayer;
}

interface SearchPostsParams {
  sessionId: string;
  windowId: string;
  query: string;
  matchPrompt: string;
  resultLimit: number;
}

interface GenerateReplyParams {
  sessionId: string;
  windowId: string;
  postLink: string;
  replyPrompt: string;
}

interface SendReplyParams {
  sessionId: string;
  windowId: string;
  reply: string;
}

export interface SessionContext {
  session: SessionResponse["data"];
  windowInfo: WindowResponse["data"];
}

export class XInteractionService {
  private readonly client: AirtopClient;
  private readonly log: LogLayer;

  constructor({ apiKey, log }: XInteractionServiceConfig) {
    this.client = new AirtopClient({ apiKey });
    this.log = log;
  }

  async initializeSessionAndBrowser(profileId?: string): Promise<SessionContext> {
    this.log.info("Initializing new session");

    const session = await this.createSession(profileId);
    const windowInfo = await this.createBrowserWindow(session.id);

    return { session, windowInfo };
  }

  private async createSession(profileId?: string) {
    const sessionResponse = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 10,
        persistProfile: !profileId,
        baseProfileId: profileId,
      },
    });

    const session = sessionResponse.data;
    this.log.info(`Created session: ${session.id}, Profile Id: ${profileId || session.profileId}`);

    if (!session.cdpWsUrl) {
      throw new Error("CDP URL not available");
    }

    return session;
  }

  private async createBrowserWindow(sessionId: string) {
    this.log.info("Creating browser window");
    const windowResponse = await this.client.windows.create(sessionId, { url: INITIAL_URL });

    const windowInfo = await this.client.windows.getWindowInfo(sessionId, windowResponse.data.windowId, {
      screenResolution: `${SCREEN_RESOLUTION.width}x${SCREEN_RESOLUTION.height}`,
      disableResize: true,
    });

    return windowInfo.data;
  }

  async checkIfSignedIntoWebsite({
    sessionId,
    windowId,
  }: {
    sessionId: string;
    windowId: string;
  }): Promise<boolean> {
    this.log.info("Determining whether the user is logged in...");
    const isLoggedInPromptResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: IS_LOGGED_IN_PROMPT,
      configuration: {
        outputSchema: IS_LOGGED_IN_OUTPUT_SCHEMA,
      },
    });

    const parsedResponse = JSON.parse(isLoggedInPromptResponse.data.modelResponse) as TIsLoggedInResult;

    if (parsedResponse.error) {
      this.handleErrors([parsedResponse.error], "Error checking if the user is logged in");
    }

    return parsedResponse.isLoggedIn;
  }

  async searchPosts({ sessionId, windowId, query, matchPrompt, resultLimit }: SearchPostsParams): Promise<TPost[]> {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://x.com/search?q=${encodedQuery}&f=live`;

    await this.navigateToSearch(sessionId, windowId, searchUrl);
    return this.extractPosts(sessionId, windowId, matchPrompt, resultLimit);
  }

  private async navigateToSearch(sessionId: string, windowId: string, url: string): Promise<void> {
    this.log.info(`Navigating to ${url}`);
    await this.client.windows.loadUrl(sessionId, windowId, {
      url,
      waitUntil: "domContentLoaded",
    });
    await sleep(2000); // Wait for dynamic content to load
  }

  private async extractPosts(
    sessionId: string,
    windowId: string,
    matchPrompt: string,
    resultLimit: number,
  ): Promise<TPost[]> {
    this.log.info("Extracting posts...");
    const startTime = Date.now();

    const extractionPrompt = trimPrompt(EXTRACT_POSTS_PROMPT, "{MATCH_PROMPT}", matchPrompt).replace(
      "{RESULT_LIMIT}",
      `${resultLimit}`,
    );

    const pageResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: extractionPrompt,
      followPaginationLinks: true,
      configuration: {
        outputSchema: EXTRACTED_POST_OUTPUT_SCHEMA,
      },
    });

    const duration = (Date.now() - startTime) / 1000;
    this.log.info("Extraction completed in:", chalk.yellow(`${duration}s`));

    const parsedResponse = JSON.parse(pageResponse.data.modelResponse || "{}") as TExtractedPostResult;
    return parsedResponse.postList;
  }

  async generateReply({
    sessionId,
    windowId,
    postLink,
    replyPrompt,
  }: GenerateReplyParams): Promise<TGeneratedReplyResult> {
    await this.navigateToPost(sessionId, windowId, postLink);
    return this.generateReplyContent(sessionId, windowId, replyPrompt);
  }

  private async navigateToPost(sessionId: string, windowId: string, postLink: string): Promise<void> {
    this.log.info(`Visiting post: ${postLink}`);
    await this.client.windows.loadUrl(sessionId, windowId, { url: postLink });
    await sleep(2000);
  }

  private async generateReplyContent(
    sessionId: string,
    windowId: string,
    replyPrompt: string,
  ): Promise<TGeneratedReplyResult> {
    const generateReplyPrompt = trimPrompt(GENERATE_REPLY_PROMPT, "{CRITERIA_PROMPT}", replyPrompt);
    const pageResponse = await this.client.windows.pageQuery(sessionId, windowId, {
      prompt: generateReplyPrompt,
      configuration: {
        outputSchema: GENERATED_REPLY_OUTPUT_SCHEMA,
      },
    });

    this.handleErrors(pageResponse.errors, "Error generating reply");

    return JSON.parse(pageResponse.data.modelResponse || "{}") as TGeneratedReplyResult;
  }

  async sendReply({ sessionId, windowId, reply }: SendReplyParams): Promise<void> {
    const typeResult = await this.typeReply(sessionId, windowId, reply);
    this.handleErrors(typeResult.errors, "Error typing reply");

    await sleep(3000);

    const clickResult = await this.clickReplyButton(sessionId, windowId);
    this.handleErrors(clickResult.errors, "Error clicking reply button");
  }

  private async typeReply(sessionId: string, windowId: string, reply: string) {
    return this.client.windows.type(sessionId, windowId, {
      elementDescription: `On the comment box with the text "Post your reply"`,
      text: reply,
      pressEnterKey: false,
    });
  }

  private async clickReplyButton(sessionId: string, windowId: string) {
    return this.client.windows.click(sessionId, windowId, {
      elementDescription: `"Reply" button`,
      configuration: { visualAnalysis: { scope: "viewport" } },
    });
  }

  private handleErrors(errors: any[] | undefined, message: string): void {
    if (errors?.length) {
      this.log.withError(errors).error(message);
      throw new Error(errors[0]?.message || message);
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    await this.client.sessions.terminate(sessionId);
    this.log.info(chalk.yellow("Session terminated"));
  }
}
