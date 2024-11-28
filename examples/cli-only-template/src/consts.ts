import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const LOGIN_URL = "https://www.linkedin.com/login";

export const IS_LOGGED_IN_PROMPT =
  "This browser is open to a page that either display's a user's Linkedin profile or prompts the user to login.  Please give me a JSON response matching the schema below.";

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

export const TARGET_URL = "https://www.linkedin.com/in/amirashkenazi/";

export const EXTRACT_DATA_PROMPT = `Given the LinkedIn profile URL, extract the following information:
Job Information: Include all past and present job titles, company names, dates of employment, job descriptions, and locations.
Education Information: Gather the school names, degrees obtained, field of study, dates attended, and any listed honors or activities.
Mutual Connections: List mutual connections by their names, current job titles, and the company they work for.`;

const OUTPUT_SCHEMA = z.object({
  profile_url: z.string(),
  personal_info: z.object({
    name: z.string(),
    headline: z.string(),
    location: z.string(),
  }),
  job_history: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      start_date: z.string().describe("In YYYY-MM format"),
      end_date: z.string().describe("In YYYY-MM format or 'Present'"),
      description: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field_of_study: z.string(),
      start_date: z.string().describe("In YYYY-MM format"),
      end_date: z.string().describe("In YYYY-MM format"),
      honors: z.array(z.string()),
      activities: z.array(z.string()),
    }),
  ),
  mutual_connections: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      company: z.string(),
    }),
  ),
  error: z.string().optional().describe("If you cannot fulfill the request, use this field to report the problem"),
});

export const EXTRACT_DATA_OUTPUT_SCHEMA = zodToJsonSchema(OUTPUT_SCHEMA);
