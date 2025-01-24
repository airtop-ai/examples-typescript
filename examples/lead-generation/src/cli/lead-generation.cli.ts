import { leadGenerationGraph } from "@/graph/graph";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";

const main = async () => {
  const log = getLogger();

  log.info("Welcome to the Lead Generation Recipe CLI!");

  const urls: string[] = [];

  // Collect URls
  while (true) {
    const url = await input({
      message: "Enter a URL (or press Enter with empty input to finish):",
    });

    if (!url) break;
    urls.push(url);

    const addMore = await confirm({
      message: "Do you want to add another URL?",
      default: true,
    });

    if (!addMore) break;
  }

  // Collect the Airtop API key
  const apiKey = await input({
    message: "Enter your Airtop API key:",
    validate: (value) => {
      if (!value) return "Please enter a valid API key";
      return true;
    },
  });

  // Collect the OpenAI API Key
  const openAiKey = await input({
    message: "Enter your OpenAI API key:",
    validate: (value) => {
      if (!value) return "Please enter a valid API key";
      return true;
    },
  });

  // run the graph
  log.info("Running the graph...");
  const result = await leadGenerationGraph(urls, { apiKey, openAiKey });
  log.info("Graph finished, lets look at the result");
  log.withMetadata(result).info("Here is the result");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
