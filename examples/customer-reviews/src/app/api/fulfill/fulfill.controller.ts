import type { FulfillResponse } from "@/app/api/fulfill/fulfill.validation";
import { FacebookCommenterService } from "@/lib/facebook-commenter.service";
import type { LogLayer } from "loglayer";

/**
 * Parameters required for the continue controller
 * @interface ContinueControllerParams
 * @property {string} apiKey - API key for authentication
 * @property {string} sessionId - Unique identifier for the current session
 * @property {string} windowId - Identifier for the browser window
 * @property {LogLayer} log - Logging utility instance
 */
interface FulfillControllerParams {
  apiKey: string;
  sessionId: string;
  windowId: string;
  log: LogLayer;
  targetId: string;
  cdpWsUrl: string;
}

/**
 * Controller to handle continuation of website's data extraction and interactions
 * @param {FulfillControllerParams} params - The parameters needed for extraction
 * @returns {Promise<FulfillResponse>} The extracted content
 */
export async function fulfillController({
  apiKey,
  log,
  sessionId,
  windowId,
  targetId,
  cdpWsUrl,
}: FulfillControllerParams): Promise<FulfillResponse> {
  // Initialize the service with API key and logging
  const service = new FacebookCommenterService({ apiKey, log });

  // Extract review using the provided session and window IDs
  const review = await service.extractCustomerReview({ sessionId, windowId });

  if (review.error) {
    log.withError(review.error).error("Unable to extract review");
    return {
      accomplished: false,
      error: review.error,
    };
  }

  // Scroll down the page to interact with the comments
  await service.scrollDown({
    targetId,
    cdpWsUrl,
    apiKey,
  });

  // Reply to customer
  const action = await service.replyToCustomer({ sessionId, windowId, review });

  // Return the extracted content wrapped in the expected response format
  return {
    accomplished: action.errors.length === 0,
    reply: review.reply,
    review: review.text,
    error: action.errors.map(({ message }) => message).join("* "),
  };
}
