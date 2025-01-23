import { Annotation } from "@langchain/langgraph";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const BASE_OUTPUT_SCHEMA = z.object({
  error: z
    .string()
    .optional()
    .describe("If you cannot find the information, use this field to report the problem.")
    .default(""),
});

export const THERAPIST_SCHEMA = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  source: z.string().optional(),
  summary: z.string().optional(),
  outreachMessage: z.string().optional(),
});

const THERAPIST_STATE_SCHEMA = z.object({
  therapists: z.array(THERAPIST_SCHEMA),
});

export const THERAPISTS_OUTPUT_SCHEMA = z.object({
  ...THERAPIST_STATE_SCHEMA.shape,
  ...BASE_OUTPUT_SCHEMA.shape,
});

export const THERAPISTS_OUTPUT_JSON_SCHEMA = zodToJsonSchema(THERAPISTS_OUTPUT_SCHEMA);

export const ENRICHED_THERAPIST_SCHEMA = z.object({
  ...THERAPIST_SCHEMA.shape,
  ...BASE_OUTPUT_SCHEMA.shape,
});

export const URL_VALIDATOR_OUTPUT_SCHEMA = z.object({
  isValid: z.boolean().optional(),
});

const URL_SCHEMA = z.object({
  ...URL_VALIDATOR_OUTPUT_SCHEMA.shape,
  url: z.string(),
});

const URL_STATE_SCHEMA = z.object({
  urls: z.array(URL_SCHEMA),
});

export const URL_OUTPUT_SCHEMA = z.object({
  ...URL_SCHEMA.shape,
  ...BASE_OUTPUT_SCHEMA.shape,
});

export const URL_OUTPUT_JSON_SCHEMA = zodToJsonSchema(URL_OUTPUT_SCHEMA);

export type UrlOutput = z.infer<typeof URL_OUTPUT_SCHEMA>;

export type Url = z.infer<typeof URL_SCHEMA>;

export type Therapist = z.infer<typeof THERAPIST_SCHEMA>;

export type TherapistState = z.infer<typeof THERAPIST_STATE_SCHEMA>;

export type UrlState = z.infer<typeof URL_STATE_SCHEMA>;

export const state = Annotation.Root({
  therapists: Annotation<Therapist[]>,
  urls: Annotation<Url[]>,
  csvContent: Annotation<string>,
  csvPath: Annotation<string>,
  error: Annotation<string>,
});
