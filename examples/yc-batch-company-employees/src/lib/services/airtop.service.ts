import { AirtopClient } from "@airtop/sdk";
import type { SessionResponse, WindowIdResponse } from "@airtop/sdk/api";
import type { LogLayer } from "loglayer";

/**
 * Service for interacting with the Airtop SDK.
 */
export class AirtopService {
  client: AirtopClient;
  log: LogLayer;

  /**
   * Creates a new instance of AirtopService.
   * @param {Object} params - Configuration parameters
   * @param {string} params.apiKey - Airtop API key
   * @param {LogLayer} params.log - Logger instance for service operations
   */
  constructor({ apiKey, log }: { apiKey: string; log: LogLayer }) {
    this.client = new AirtopClient({ apiKey });

    this.log = log;
  }

  /**
   * Creates a new session.
   * @param profileId - The ID of the profile to use for the session
   * @returns The created session
   */
  async createSession(profileId?: string): Promise<SessionResponse> {
    const session = await this.client.sessions.create({
      configuration: {
        timeoutMinutes: 15,
        persistProfile: true,
        ...(profileId ? { baseProfileId: profileId } : {}),
      },
    });

    return session;
  }

  /**
   * Terminates a session.
   * @param sessionId - The ID of the session to terminate
   */
  async terminateSession(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return;
    }

    this.log.debug(`Terminating session: ${sessionId}`);

    // Terminate the session
    await this.client.sessions.terminate(sessionId);
  }

  /**
   * Creates a new window.
   * @param sessionId - The ID of the session to create the window in
   * @param url - The URL to navigate to
   * @returns The created window
   */
  async createWindow(sessionId: string, url: string): Promise<WindowIdResponse> {
    const window = await this.client.windows.create(sessionId, { url });

    return window;
  }
}
