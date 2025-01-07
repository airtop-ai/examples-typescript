import { getLogger, serializeErrors } from "@local/utils";
import { NextResponse } from "next/server";
import { searchPostsController } from "./search.controller";
import { type SearchPostsRequest, type SearchPostsResponse, searchPostsSchema } from "./search.validation";

export const maxDuration = 300;

/**
 * Searches for posts in X.
 */
export async function POST(request: Request) {
  const log = getLogger().withPrefix("[api/search-posts]");
  try {
    const data = (await request.json()) as SearchPostsRequest;
    log.info("Validating request data");
    searchPostsSchema.parse(data);

    const controllerResponse = await searchPostsController({ log, ...data });
    return NextResponse.json<SearchPostsResponse>(controllerResponse);
  } catch (e: any) {
    return NextResponse.json(serializeErrors(e), {
      status: 500,
    });
  }
}
