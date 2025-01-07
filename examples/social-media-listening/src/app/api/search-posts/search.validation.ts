import { z } from "zod";

export const searchPostsSchema = z.object({
  apiKey: z.string().min(10).describe("The API key to use for the request"),
  sessionId: z.string().min(10).describe("The session ID to use for the request"),
  windowId: z.string().min(10).describe("The window ID to use for the request"),
  query: z.string().min(3).describe("The query to search for"),
  matchPrompt: z.string().min(3).describe("The prompt to match the posts"),
  resultLimit: z.number().min(1).describe("The number of posts to extract"),
});

export const searchPostsResponseSchema = z.object({
  posts: z.array(
    z.object({
      text: z.string(),
      username: z.string(),
      link: z.string(),
    }),
  ),
});

export type SearchPostsRequest = z.infer<typeof searchPostsSchema>;
export type SearchPostsResponse = z.infer<typeof searchPostsResponseSchema>;
