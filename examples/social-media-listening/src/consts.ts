import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Configuration constants
export const PROCESS_DELAY = 3000;
export const SCREEN_RESOLUTION = {
  width: 1920,
  height: 1080,
} as const;

// Base URLs
export const INITIAL_URL = "https://x.com";
export const SEARCH_URL = "https://x.com/explore";

export const DEFAULT_RESULT_LIMIT = 1;

export const DEFAULT_INPUTS = {
  resultLimit: DEFAULT_RESULT_LIMIT,
  query: "#ai #agents #langchain",
  matchPrompt: "The author shares a project or tool regarding AI frameworks",
  replyPrompt:
    "Friendly response about the original post and recommending Airtop, an AI-powered cloud browser for web automation (airtop.ai).",
} as const;

// Login validation schemas
export const IS_LOGGED_IN_PROMPT =
  "This view displays either X home page or the login form. Follow the JSON schema below.";

export const IS_LOGGED_IN_OUTPUT = z.object({
  isLoggedIn: z.boolean().describe("Indicate whether the user is logged in or not."),
  error: z.string().describe("If you cannot fulfill the request, use this field to report the problem."),
});

export const IS_LOGGED_IN_OUTPUT_SCHEMA = zodToJsonSchema(IS_LOGGED_IN_OUTPUT);

// Post schema definitions
const postSchema = z
  .object({
    link: z.string().describe("The URL to the post"),
    text: z.string().describe("The post content"),
    username: z.string().describe("The author's username"),
  })
  .describe("Post information");

export const EXTRACT_POSTS_PROMPT = `This is the X feed. Please extract the first {RESULT_LIMIT} posts that match the criteria below, extract the URL to the post, the author's username and the post content.

Criteria: {MATCH_PROMPT}`;

export const EXTRACTED_POST_OUTPUT = z.object({
  postList: z.array(postSchema),
});

export const GENERATE_REPLY_PROMPT = `This is a post in X. Please reply to the post using less than 30 words and follow the criteria below.

Criteria: {CRITERIA_PROMPT}`;

export const GENERATED_REPLY_OUTPUT = z.object({
  reply: z.string().describe("The reply to the post"),
  error: z.string().describe("If you cannot fulfill the request, use this field to report the problem."),
});

export const GENERATED_REPLY_OUTPUT_SCHEMA = zodToJsonSchema(GENERATED_REPLY_OUTPUT);
export const EXTRACTED_POST_OUTPUT_SCHEMA = zodToJsonSchema(EXTRACTED_POST_OUTPUT);

// Type exports
export type TIsLoggedInResult = z.infer<typeof IS_LOGGED_IN_OUTPUT>;
export type TPost = z.infer<typeof postSchema>;
export type TExtractedPostResult = z.infer<typeof EXTRACTED_POST_OUTPUT>;
export type TGeneratedReplyResult = z.infer<typeof GENERATED_REPLY_OUTPUT>;
