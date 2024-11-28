export const INITIAL_URL = "https://google.com/finance/";

export const DEFAULT_STOCK_SYMBOL = "NVDA";

export const STOCK_PERFORMANCE_PROMPT = (ticker: string) =>
  `This browser is open to a page that displays the stock performance of ${ticker} over the past 6 months. Please give me a JSON response matching the schema below.`;

export const STOCK_PERFORMANCE_OUTPUT_SCHEMA = (ticker: string) => ({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    analysis: {
      type: "string",
      description: `A one sentence analysis of the price performance of ${ticker} over the past 6 months.`,
    },
    percentChange: {
      type: "number",
      description: `The percentage change in the price of ${ticker} over the past 6 months.`,
    },
    error: {
      type: "string",
      description: "If you cannot fulfill the request, use this field to report the problem.",
    },
  },
});

export const ANIMATION_DELAY = 3000;

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
