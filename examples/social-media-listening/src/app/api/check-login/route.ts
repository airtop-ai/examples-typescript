import { getLogger, serializeErrors } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";
import { loginController } from "./login.controller";
import { type CheckLoginRequest, type CheckLoginResponse, checkLoginRequestSchema } from "./login.validation";

export const maxDuration = 300;

/**
 * Checks if the user is logged in to X.
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/check-login]");
  log.info("Checking login...");

  const data = (await request.json()) as CheckLoginRequest;

  log.info("Validating request data");

  try {
    checkLoginRequestSchema.parse(data);

    const controllerResponse = await loginController({ log, ...data });
    return NextResponse.json<CheckLoginResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
