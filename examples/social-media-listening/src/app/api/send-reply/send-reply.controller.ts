import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";
import type { SendReplyResponse } from "./send-reply.validation";

interface SendReplyControllerParams {
  apiKey: string;
  log: LogLayer;
  sessionId: string;
  windowId: string;
  reply: string;
}

export async function sendReplyController({
  apiKey,
  log,
  sessionId,
  windowId,
  reply,
}: SendReplyControllerParams): Promise<SendReplyResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log });

  // Search for posts
  await service.sendReply({ sessionId, windowId, reply });

  // Return result
  return { message: "Reply sent successfully" };
}
