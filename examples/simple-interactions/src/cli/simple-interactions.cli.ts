import { DEFAULT_STOCK_SYMBOL } from "@/consts";
import { InteractionsService } from "@/lib/interactions.service";
import { input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to interact with the browser.
 */
async function cli() {
  const log = getLogger();

  const apiKey = await input({
    message: "Enter your Airtop API key:",
    required: true,
  });

  const profileId = await input({
    message: "(optional) Enter a browser profile ID to use:",
    required: false,
  });

  const service = new InteractionsService({
    apiKey,
    log,
    ticker: DEFAULT_STOCK_SYMBOL,
  });

  let sessionAndWindow = undefined;

  try {
    sessionAndWindow = await service.initializeSessionAndBrowser(profileId);
    const { session, windowInfo } = sessionAndWindow;

    log.info("Live view URL:", windowInfo.data.liveViewUrl);

    await service.searchForStockPerformance({
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
    });

    await service.clickOnStockPerformanceChart({
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
    });

    const content = await service.extractStockPerformanceData({
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
    });

    const formattedJson = JSON.stringify(JSON.parse(content), null, 2);

    log.info("Response:\n\n", chalk.green(formattedJson));

    log.info("Extraction completed successfully");
  } finally {
    if (sessionAndWindow?.session) {
      await service.terminateSession(sessionAndWindow.session.id);
    }
  }
}

cli().catch((e) => {
  console.log(chalk.red("An error occurred"));
  console.error(e);
  process.exit(1);
});
