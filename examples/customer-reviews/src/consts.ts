import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const LOGIN_URL = "https://www.facebook.com/login";

// Login Prompt
export const IS_LOGGED_IN_PROMPT =
  "This browser is open to a page that either display's a restaurant profile or prompts the user to login.  Please give me a JSON response matching the schema below.";

export const IS_LOGGED_IN_OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    isLoggedIn: {
      type: "boolean",
      description: "Use this field to indicate whether the user is logged in.",
    },
    error: {
      type: "string",
      description: "If you cannot fulfill the request, use this field to report the problem.",
    },
  },
};

export const TARGET_URL = "https://www.facebook.com/profile.php?id=61568726925735&sk=reviews";

// Exgtract customer review
export const EXTRACT_REVIEW_PROMPT = `
  You are on the Sushi-Taco facebook's page. From the comments that customers left, find the first review that is uncommented and do the following:
  - Extract the review text.
  - Define if the review is positive or negative.
  - Generate a reply addressing this review.
`.trim();

const OUTPUT_SCHEMA = z.object({
  text: z.string().describe("Review's content"),
  sentiment: z.string().describe("Either 'positive' or 'negative'"),
  reply: z.string(),
  error: z.string().optional().describe("If you cannot fulfill the request, use this field to report the problem"),
});

export const EXTRACT_REVIEW_OUTPUT_SCHEMA = zodToJsonSchema(OUTPUT_SCHEMA);
export type TReviewOutput = z.infer<typeof OUTPUT_SCHEMA>;
