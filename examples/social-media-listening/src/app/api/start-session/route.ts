import { startController } from "@/app/api/start-session/start.controller";
import {
  type StartSessionRequest,
  type StartSessionResponse,
  startSessionRequestSchema,
} from "@/app/api/start-session/start.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * Initializes the Airtop session and start the process of interacting with the browser.
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/start-session]");

  log.info("Starting session...");

  const data = (await request.json()) as StartSessionRequest;

  log.info("Validating request data");

  try {
    startSessionRequestSchema.parse(data);

    const controllerResponse = await startController({ log, ...data });
    return NextResponse.json<StartSessionResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
