import { getLogger, serializeErrors } from "@local/utils";
import { NextResponse } from "next/server";
import { sendReplyController } from "./send-reply.controller";
import { type SendReplyRequest, type SendReplyResponse, sendReplySchema } from "./send-reply.validation";

export const maxDuration = 300;

/**
 * Posts the generated reply to thread in X.
 */
export async function POST(request: Request) {
  const log = getLogger().withPrefix("[api/send-reply]");
  try {
    const data = (await request.json()) as SendReplyRequest;
    log.info("Validating request data");
    sendReplySchema.parse(data);

    const controllerResponse = await sendReplyController({ log, ...data });
    return NextResponse.json<SendReplyResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
