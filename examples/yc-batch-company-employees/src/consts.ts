import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const LINKEDIN_LOGIN_URL = "https://www.linkedin.com/login";
export const LINKEDIN_FEED_URL = "https://www.linkedin.com/feed/";

/**
 * Base schema for all responses
 * Contains the error field which is optional
 */
const baseSchema = z.object({
  error: z.string().optional().describe("If you cannot fulfill the request, use this field to report the problem"),
});

export const IS_LOGGED_IN_PROMPT =
  "This browser is open to a page that either display's a user's Linkedin feed or prompts the user to login.  Please give me a JSON response matching the schema below.";

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

const IS_LOGGED_IN_SCHEMA = baseSchema.extend({
  isLoggedIn: z.boolean().describe("Whether the user is logged in or not"),
});

export type IsLoggedInResponse = z.infer<typeof IS_LOGGED_IN_SCHEMA>;

export const YC_COMPANIES_URL = "https://www.ycombinator.com/companies";

export const GET_YC_BATCHES_PROMPT = `
You are looking at a startup directory page from Y Combinator. The startups are organized based on industry, region, company size, batch, and others.
Your task is to extract the list of batches from the page.
Batches follow the format: [Season][Year] where:
- Season is F (Fall), S (Spring), or W (Winter)
- Year is a 2-digit number (e.g., 24, 23, 22)
Examples: F24, S24, W24

Only include batches that appear in the dedicated batch filter/selection section of the page.
Return an empty array if no valid batches are found.`;

const GET_YC_BATCHES_SCHEMA = baseSchema.extend({
  batches: z.array(z.string()),
});

export type GetYcBatchesResponse = z.infer<typeof GET_YC_BATCHES_SCHEMA>;

export const GET_YC_BATCHES_OUTPUT_SCHEMA = zodToJsonSchema(GET_YC_BATCHES_SCHEMA);

export const GET_COMPANIES_IN_BATCH_PROMPT = `
You are looking at a startup directory page from Y Combinator that has been filtered by batch. 
Your task is to extract information for the companies listed on the page.
Only extract the first 10 companies listed on the page.

For each company, extract:
1. Name (required): The company name exactly as shown (e.g., "Airtop")
2. Location (optional): The full location if provided (e.g., "San Francisco, CA")
3. Link (required): The full Y Combinator company URL (e.g., "https://ycombinator.com/companies/airtop")

Important:
- Only extract companies that have both a name and a valid YC link
- Return an empty array if no valid companies are found
`;

const GET_COMPANIES_IN_BATCH_SCHEMA = baseSchema.extend({
  companies: z.array(
    z.object({
      name: z.string(),
      location: z.string().optional(),
      link: z.string(),
    }),
  ),
});

export const GET_COMPANIES_IN_BATCH_OUTPUT_SCHEMA = zodToJsonSchema(GET_COMPANIES_IN_BATCH_SCHEMA);
export type Company = z.infer<typeof GET_COMPANIES_IN_BATCH_SCHEMA>["companies"][number];
export type GetCompaniesInBatchResponse = z.infer<typeof GET_COMPANIES_IN_BATCH_SCHEMA>;

export const GET_COMPANY_LINKEDIN_PROFILE_URL_PROMPT = `
You are looking at a specific company's profile page on Y Combinator.
Your task is to extract the company's official LinkedIn URL.

Guidelines:
1. The LinkedIn URL should be from the company information section alongside the company's name, founded year, team size, location, and other information.
2. Valid formats include (but are not limited to):
   - https://www.linkedin.com/company/[company-name]
   - https://linkedin.com/company/[company-name]
3. Do NOT extract:
   - Personal LinkedIn profiles of founders/employees
   - LinkedIn URLs from other sections of the page
   - Malformed or partial LinkedIn URLs

Return null if:
- No LinkedIn URL is present
- Only founder/employee LinkedIn profiles are found
- The URL format is invalid or suspicious
`;

const GET_COMPANY_LINKEDIN_PROFILE_URL_SCHEMA = baseSchema.extend({
  linkedInProfileUrl: z.string().nullable().describe("The LinkedIn profile URL or null if not found"),
});

export const GET_COMPANY_LINKEDIN_PROFILE_URL_OUTPUT_SCHEMA = zodToJsonSchema(GET_COMPANY_LINKEDIN_PROFILE_URL_SCHEMA);
export type GetCompanyLinkedInProfileUrlResponse = z.infer<typeof GET_COMPANY_LINKEDIN_PROFILE_URL_SCHEMA>;
