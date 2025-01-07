import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";
import type { CheckLoginResponse } from "./login.validation";

interface LoginControllerParams {
  apiKey: string;
  log: LogLayer;
  sessionId: string;
  windowId: string;
}

export async function loginController({
  apiKey,
  log,
  sessionId,
  windowId,
}: LoginControllerParams): Promise<CheckLoginResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log });

  const isSignedIn = await service.checkIfSignedIntoWebsite({ sessionId, windowId });

  // Return result
  return { isSignedIn };
}
