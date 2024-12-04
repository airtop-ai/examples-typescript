import { LinkedInExtractorService } from "@/lib/linkedin-extractor.service";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to extract data from LinkedIn.
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

  const service = new LinkedInExtractorService({
    apiKey,
    log,
  });

  let sessionAndWindow = undefined;

  try {
    sessionAndWindow = await service.initializeSessionAndBrowser(profileId);
    const { session, windowInfo } = sessionAndWindow;

    const isSignedIn = await service.checkIfSignedIntoLinkedIn({
      sessionId: session.id,
      windowId: windowInfo.data.windowId,
    });

    if (!isSignedIn) {
      log.info("");
      log.info(
        chalk.blue("Sign-in to Linkedin is required, please sign-in to using this live view URL on your browser:"),
      );

      log.info(windowInfo.data.liveViewUrl);
      log.info("");

      await confirm({ message: "Press enter once you have signed in", default: true });
    }

    const content = await service.extractLinkedInData({
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
  console.error(e);
  process.exit(1);
});
