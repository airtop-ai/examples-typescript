import { fulfillController } from "@/app/api/fulfill/fulfill.controller";
import { type FulfillRequest, type FulfillResponse, fulfillRequestSchema } from "@/app/api/fulfill/fulfill.validation";
import { getLogger } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * Continues with the task after the user has completed sign-in.
 */
export async function POST(request: NextRequest): Promise<NextResponse<FulfillResponse>> {
  const log = getLogger().withPrefix("[api/fulfill]");
  const data = (await request.json()) as FulfillRequest;

  log.info("Validating request data");
  fulfillRequestSchema.parse(data);

  const response = await fulfillController({
    log,
    ...data,
  });

  return NextResponse.json<FulfillResponse>(response);
}
