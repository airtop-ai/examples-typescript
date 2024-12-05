import type { StartResponse } from "@/app/api/start/start.validation";
import { getServices } from "@/lib/services";
import { YCExtractorService } from "@/lib/services/yc-extractor.service";
import type { LogLayer } from "loglayer";

interface StartControllerParams {
  apiKey: string;
  profileId?: string;
  log: LogLayer;
}

export async function startController({ apiKey, log, profileId }: StartControllerParams): Promise<StartResponse> {
  // Initialize the LinkedIn extractor service
  const { airtop, linkedin } = getServices(apiKey, log);

  // Create a new session
  const session = await linkedin.airtop.createSession(profileId);

  try {
    const isLoggedIn = await linkedin.checkIfSignedIntoLinkedIn(session.data.id);

    if (!isLoggedIn) {
      const liveViewUrl = await linkedin.getLinkedInLoginPageLiveViewUrl(session.data.id);
      log.withMetadata({ liveViewUrl }).info("User needs to login to LinkedIn, returning live view URL");

      return {
        sessionId: session.data.id,
        profileId: session.data.profileId, // Use latest profile id
        liveViewUrl,
        signInRequired: true,
      };
    }

    // Initialize the YC extractor service
    const service = new YCExtractorService({ airtop, log });

    // Fetch YC batches
    const batches = await service.getYcBatches(session.data.id);

    // Return the batches in the response
    return {
      sessionId: session.data.id,
      profileId, // Use provided profile id
      batches: batches,
      signInRequired: false,
    };
  } catch (error) {
    await airtop.terminateSession(session.data.id);
    throw error;
  }
}
