import { FacebookCommenterService } from "@/lib/facebook-commenter.service";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to answer customer reviews in Facebook.
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

  const service = new FacebookCommenterService({
    apiKey,
    log,
  });

  let sessionAndWindow = undefined;

  try {
    sessionAndWindow = await service.initializeSessionAndBrowser(profileId);
    const { session, windowInfo } = sessionAndWindow;
    const sessionId = session.id;
    const windowId = windowInfo.data.windowId;
    log.warn(windowInfo.data.liveViewUrl);

    const isSignedIn = await service.checkIfSignedIntoWebsite({
      sessionId,
      windowId,
    });

    if (!isSignedIn) {
      log.info("");
      log.info(
        chalk.blue("Sign-in to Facebook is required, please sign-in to using this live view URL on your browser:"),
      );

      log.info(windowInfo.data.liveViewUrl);
      log.info("");

      await confirm({ message: "Press enter once you have signed in", default: true });
    }

    // Extract review using the provided session and window IDs
    const review = await service.extractCustomerReview({ sessionId, windowId });
    log.withMetadata(review).info("Result from extracting review");

    // Scroll down the page to interact with the comments
    await service.scrollDown({
      targetId: windowInfo.targetId as string,
      cdpWsUrl: session.cdpWsUrl as string,
      apiKey,
    });

    // Reply to customer
    const { errors } = await service.replyToCustomer({ sessionId, windowId, review });
    if (errors.length) {
      log.withError(errors).error("Unable to extract customer review");
      throw new Error("Unable to extract customer review", { cause: errors });
    }

    log.info("Task completed successfully");
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
