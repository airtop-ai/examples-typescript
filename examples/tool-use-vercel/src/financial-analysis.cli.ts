import { FinancialAnalysisService } from "@/financial-analysis.service";
import { input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import { config } from "dotenv";

// Load environment variables from .env file
config();

async function cli() {
  const log = getLogger();

  let apiKey = process.env.AIRTOP_API_KEY;
  if (!apiKey) {
    apiKey = await input({
      message: "Enter your Airtop API key:",
      required: true,
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment");
  }

  const service = new FinancialAnalysisService({
    apiKey,
    log,
  });

  let sessionAndWindow = undefined;

  try {
    sessionAndWindow = await service.initializeSessionAndBrowser();
    const { session, windowInfo } = sessionAndWindow;

    log.info("LiveView URL:", windowInfo.data.liveViewUrl);
    const analysis = await service.performAnalysis(session.id, windowInfo.data.windowId);
    log.info("Analysis:", analysis);
  } finally {
    if (sessionAndWindow?.session) {
      await service.terminateSession(sessionAndWindow.session.id);
    }
  }
}

cli().catch((e) => {
  console.error(e);
  process.exit(1);
});
