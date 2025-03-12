import fs from "node:fs";
import { leadGenerationGraph, leadGenerationGraphFinish } from "@/graph/graph";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";

const log = getLogger();

const main = async () => {
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

      if (!value.startsWith("sk-")) return "Please enter a valid OpenAI API key";
      return true;
    },
  });

  // run the graph
  log.info("Running the graph...");
  const firstGraphResult = await leadGenerationGraph(urls, { apiKey, openAiKey });

  const therapists = firstGraphResult.therapists;

  const result = await leadGenerationGraphFinish(therapists, { apiKey, openAiKey });

  if (result.csvContent) {
    const csvFileName = "lead-generation-results.csv";
    fs.writeFileSync(csvFileName, result.csvContent);
    log.info("CSV file created successfully");
    log.info(`File location: ${process.cwd()}/${csvFileName}`);

    log.info("Graph finished, lets look at the result");
    log.withMetadata(result).info("Here is the result");
  }

  if (result.error) {
    log.withError(result.error).error("An error occurred while running the graph");
  }
};

main().catch((e) => {
  log.withError(e).error("An error occurred while running the graph");
  process.exit(1);
});
