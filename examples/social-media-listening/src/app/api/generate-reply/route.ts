import { getLogger, serializeErrors } from "@local/utils";
import { NextResponse } from "next/server";
import { generateReplyController } from "./generate-reply.controller";
import {
  type GenerateReplyRequest,
  type GenerateReplyResponse,
  generateReplySchema,
} from "./generate-reply.validation";

export const maxDuration = 300;

/**
 * Generates a reply to the given post.
 */
export async function POST(request: Request) {
  const log = getLogger().withPrefix("[api/generate-reply]");
  try {
    const data = (await request.json()) as GenerateReplyRequest;

    log.info("Validating request data");
    generateReplySchema.parse(data);

    const controllerResponse = await generateReplyController({ log, ...data });
    return NextResponse.json<GenerateReplyResponse>(controllerResponse);
  } catch (e: any) {
    log.error("Error generating reply:", e);
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
