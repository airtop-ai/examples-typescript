import "dotenv/config";
import { DEFAULT_INPUTS } from "@/consts";
import { XInteractionService } from "@/lib/x-interaction.service";
import { getUserInputs, runningDefaultMode } from "@/utils";
import { confirm, input } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

interface SessionContext {
  session: { id: string };
  windowInfo: { windowId: string; liveViewUrl: string };
}

interface TaskConfig {
  query: string;
  matchPrompt: string;
  replyPrompt: string;
  resultLimit: string | number;
}

class CliError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CliError";
  }
}

async function runSocialMediaMonitor(
  service: XInteractionService,
  sessionContext: SessionContext,
  taskConfig: TaskConfig,
) {
  const log = getLogger();
  const { session, windowInfo } = sessionContext;

  log.info("Live View URL:", chalk.blue(windowInfo.liveViewUrl));

  const isLoggedIn = await service.checkIfSignedIntoWebsite({
    sessionId: session.id,
    windowId: windowInfo.windowId,
  });

  if (!isLoggedIn) {
    log.info(chalk.yellow("You are not logged in. Please log in using the Live View URL above."));
    await input({
      message: "Press any key once you are logged in...",
    });
  }

  const postList = await service.searchPosts({
    sessionId: session.id,
    windowId: windowInfo.windowId,
    query: taskConfig.query,
    matchPrompt: taskConfig.matchPrompt,
    resultLimit: Number(taskConfig.resultLimit),
  });

  if (!postList.length) {
    throw new CliError("Could not find any posts matching the query. Consider changing the query.");
  }

  log.info(`Found ${chalk.blue(postList.length)} posts matching the query.`);

  const post = postList[0]!;
  const { reply } = await service.generateReply({
    sessionId: session.id,
    windowId: windowInfo.windowId,
    postLink: post.link,
    replyPrompt: taskConfig.replyPrompt,
  });

  log.info("\n**** First matched post ****");
  log.info(`Username: ${post.username}`);
  log.info(`Content: ${post.text}`);
  log.info(`Suggested reply: ${chalk.green(reply)}`);
  log.info("****************************\n");

  const proceed = await confirm({
    message: "Would you like to send the suggested reply?",
  });

  if (!proceed) {
    log.warn("Operation cancelled by user");
    return;
  }

  await service.sendReply({
    sessionId: session.id,
    windowId: windowInfo.windowId,
    reply,
  });

  log.info(chalk.green("Reply sent successfully!"));
}

async function cli() {
  const log = getLogger();
  let sessionContext: SessionContext | undefined;
  let service: XInteractionService | undefined;

  try {
    const apiKey =
      process.env.AIRTOP_API_KEY ||
      (await input({
        message: "Enter your Airtop API key:",
        validate: (value) => (value.length > 0 ? true : "API key cannot be empty"),
      }));

    const profileId =
      process.env.AIRTOP_PROFILE_ID ||
      (await input({
        message: "(Optional) Enter Airtop Profile ID:",
      }));

    const taskConfig = runningDefaultMode() ? DEFAULT_INPUTS : await getUserInputs();

    service = new XInteractionService({
      apiKey,
      log,
    });

    const cleanup = async () => {
      if (sessionContext?.session) {
        log.info("Cleaning up session...");
        await service?.terminateSession(sessionContext.session.id);
      }
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    sessionContext = await service.initializeSessionAndBrowser(profileId);
    await runSocialMediaMonitor(service, sessionContext, taskConfig);
  } catch (error) {
    if (error instanceof CliError) {
      log.warn(error.message);
      if (error.cause) log.withMetadata({ cause: error.cause }).debug("");
    } else {
      log.withError(error).error("An unexpected error occurred:");
    }
    process.exit(1);
  } finally {
    if (sessionContext?.session && service) {
      await service.terminateSession(sessionContext.session.id);
    }
  }
}

cli().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
