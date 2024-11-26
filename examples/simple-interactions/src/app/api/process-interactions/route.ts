import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";
import { processInteractionsController } from "./process-interactions.controller";
import {
  type ProcessInteractionsRequest,
  type ProcessInteractionsResponse,
  processInteractionsRequestSchema,
} from "./process-interactions.validation";

export const maxDuration = 300;

/**
 * Initializes the Airtop session and start the process of interacting with the browser.
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/process-interactions]");

  const data = (await request.json()) as ProcessInteractionsRequest;

  log.withMetadata({ data }).info("Validating request data");

  try {
    processInteractionsRequestSchema.parse(data);

    log.withMetadata({ obj: { log, ...data } }).info("Processing interactions");
    const controllerResponse = await processInteractionsController({ log, ...data });
    return NextResponse.json<ProcessInteractionsResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
