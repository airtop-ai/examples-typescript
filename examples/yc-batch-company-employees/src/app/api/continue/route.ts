import { continueController } from "@/app/api/continue/continue.controller";
import {
  type ContinueRequest,
  type ContinueResponse,
  continueRequestSchema,
} from "@/app/api/continue/continue.validation";
import { getLogger } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * Continues the process of extracting data from yCombinator after the user has completed sign-in.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContinueResponse>> {
  const log = getLogger().withPrefix("[api/continue]");

  const data = (await request.json()) as ContinueRequest;

  log.info("Validating request data");
  continueRequestSchema.parse(data);

  const response = await continueController({
    log,
    ...data,
  });

  return NextResponse.json<ContinueResponse>(response);
}
