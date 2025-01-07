import { XInteractionService } from "@/lib/x-interaction.service";
import type { LogLayer } from "loglayer";
import type { SearchPostsResponse } from "./search.validation";

interface SearchPostsControllerParams {
  apiKey: string;
  log: LogLayer;
  sessionId: string;
  windowId: string;
  query: string;
  matchPrompt: string;
  resultLimit: number;
}

export async function searchPostsController({
  apiKey,
  log,
  sessionId,
  windowId,
  query,
  matchPrompt,
  resultLimit,
}: SearchPostsControllerParams): Promise<SearchPostsResponse> {
  // Initialize the interactions service
  const service = new XInteractionService({ apiKey, log });

  // Search for posts
  log.withMetadata({ query, matchPrompt }).info("Searching...");
  const posts = await service.searchPosts({ sessionId, windowId, query, matchPrompt, resultLimit });

  // Return result
  return { posts };
}
