import { startController } from "@/app/api/start/start.controller";
import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * Initializes the Airtop session and start the process of extracting data from yCombinator and LinkedIn.
 * - Returns with a URL for the user to sign in via the live session if necessary
 * - Otherwise, will return with the extracted data
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/start]").withMetadata({
    url: request.url,
    method: request.method,
  });

  log.info("Received start request");

  try {
    const data = (await request.json()) as StartRequest;
    log.withMetadata({ urls: data.urls }).debug("Request payload");

    // Validate request data
    try {
      startRequestSchema.parse(data);
    } catch (e) {
      log.withError(e).error("Request validation failed");
      return NextResponse.json(serializeErrors(e), { status: 400 });
    }

    // Execute controller
    const controllerResponse = await startController({ ...data });
    log.info("Request processed successfully");

    return NextResponse.json<StartResponse>(controllerResponse);
  } catch (e: any) {
    log.withError(e).error("Failed to process request");
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
