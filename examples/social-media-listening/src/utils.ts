import { input } from "@inquirer/prompts";
import { DEFAULT_RESULT_LIMIT } from "./consts";

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getUserInputs = async () => {
  return {
    query: await input({
      message: "Enter the terms or hashtags to search for (e.g., #ai #agent):",
      required: true,
    }),
    matchPrompt: await input({
      message:
        "Define the criteria for selecting posts to reply to (e.g., a post where the author asks about AI frameworks):",
      required: true,
    }),
    replyPrompt: await input({
      message: "What should the reply look like?  (e.g., a friendly response recommending Airtop):",
      required: true,
    }),
    resultLimit: await input({
      message: "How many posts to extract?:",
      default: DEFAULT_RESULT_LIMIT.toString(),
    }),
  };
};

export const runningDefaultMode = () => {
  const args = process.argv.slice(2);
  return args.includes("--defaults");
};

export const trimPrompt = (prompt: string, match: string, replace: string): string => {
  return prompt
    .replace(match, replace)
    .replace(/ {2,}(?!\n)/g, "") // trim extra spaces
    .trim();
};
