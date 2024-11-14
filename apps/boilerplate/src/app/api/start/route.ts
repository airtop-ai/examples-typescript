import { continueController } from "@/app/api/continue/continue.controller";
import { startController } from "@/app/api/start/start.controller";
import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { logger } from "@/lib/logging";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Initializes the Airtop session and start the process of extracting data from LinkedIn.
 * - Returns with a URL for the user to sign in via the live session if necessary
 * - Otherwise, will return with the extracted data
 */
export async function POST(request: NextRequest): Promise<NextResponse<StartResponse>> {
  const log = logger.withPrefix("[api/start]");

  const data = (await request.json()) as StartRequest;

  log.info("Validating request data");
  startRequestSchema.parse(data);

  const controllerResponse = await startController({ log, ...data });

  // A sign in is required, we'll return early with the live view URL
  // so the user can sign in
  if (controllerResponse.signInRequired) {
    return NextResponse.json<StartResponse>(controllerResponse);
  }

  // Continue with the process of extracting data
  const continueResponse = await continueController({
    apiKey: data.apiKey,
    sessionId: controllerResponse.sessionId as string,
    windowId: controllerResponse.windowId as string,
    log,
  });

  return NextResponse.json<StartResponse>({
    signInRequired: false,
    ...continueResponse,
  });
}