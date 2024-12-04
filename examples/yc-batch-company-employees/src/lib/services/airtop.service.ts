import { AirtopClient } from "@airtop/sdk";
import type { SessionResponse, WindowIdResponse } from "@airtop/sdk/api";
import type { LogLayer } from "loglayer";

/**
 * Service for interacting with the Airtop SDK.
 */
export class AirtopService {
  client: AirtopClient;
  savedSessions: Map<string, SessionResponse>;
  savedWindows: Map<string, { sessionId: string; windowId: string }>;
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
    this.savedSessions = new Map();
    this.savedWindows = new Map();
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

    this.savedSessions.set(session.data.id, session);

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

    const session = this.savedSessions.has(sessionId);

    if (!session) {
      return;
    }

    this.log.debug(`Terminating session: ${sessionId}`);

    // Terminate the session
    await this.client.sessions.terminate(sessionId);

    this.savedSessions.delete(sessionId);
  }

  /**
   * Terminates all sessions.
   */
  async terminateAllSessions(): Promise<void> {
    for (const [sessionId] of this.savedSessions) {
      await this.terminateSession(sessionId);
    }
  }

  /**
   * Creates a new window.
   * @param sessionId - The ID of the session to create the window in
   * @param url - The URL to navigate to
   * @returns The created window
   */
  async createWindow(sessionId: string, url: string): Promise<WindowIdResponse> {
    const window = await this.client.windows.create(sessionId, { url });

    this.savedWindows.set(window.data.windowId, { sessionId, windowId: window.data.windowId });

    return window;
  }

  /**
   * Terminates a window.
   * @param windowId - The ID of the window to terminate
   */
  async terminateWindow(windowId: string | undefined): Promise<void> {
    if (!windowId) {
      return;
    }

    const window = this.savedWindows.get(windowId);

    if (!window) {
      return;
    }

    this.log.debug(`Terminating window: ${window.windowId}`);

    // Close the window
    await this.client.windows.close(window.sessionId, window.windowId);

    // Remove the window from the list
    this.savedWindows.delete(windowId);
  }

  /**
   * Terminates all windows.
   */
  async terminateAllWindows(): Promise<void> {
    for (const [windowId] of this.savedWindows) {
      await this.terminateWindow(windowId);
    }
  }
}
