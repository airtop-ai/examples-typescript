import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";
import type { GenerateReplyResponse } from "./generate-reply.validation";

interface GenerateReplyControllerParams {
  apiKey: string;
  log: LogLayer;
  sessionId: string;
  windowId: string;
  postLink: string;
  replyPrompt: string;
}

export async function generateReplyController({
  apiKey,
  log,
  sessionId,
  windowId,
  postLink,
  replyPrompt,
}: GenerateReplyControllerParams): Promise<GenerateReplyResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log });

  // Generate a reply
  const result = await service.generateReply({ sessionId, windowId, postLink, replyPrompt });

  // Return result
  return result;
}
