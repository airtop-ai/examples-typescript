import { LinkedInExtractorService } from "@/linkedin-extractor.service";
import { confirm, input, select } from "@inquirer/prompts";
import { getLogger } from "@local/utils";
import chalk from "chalk";

/**
 * Command line example that uses Airtop to extract data from LinkedIn.
 */
async function cli() {
  const log = getLogger();
  let profileName = "";

  const apiKey = await input({
    message: "Enter your Airtop API key:",
    required: true,
  });

  const profileAnswer = await select({
    message: "Do you want to use a profile for this session?",
    choices: [
      {
        name: "Create a new profile",
        value: "create",
        short: "Create one",
      },
      {
        name: "Use an existing profile",
        value: "use",
        short: "Use existing",
      },
      {
        name: "Don't use a profile",
        value: "none",
        short: "None",
      },
    ],
  });

  if (profileAnswer === "create" || profileAnswer === "use") {
    profileName = await input({
      message: "Enter the profile name to use in the session:",
      required: true,
    });
  }

  const service = new LinkedInExtractorService({
    apiKey,
    log,
  });

  let sessionAndWindow = undefined;

  try {
    sessionAndWindow = await service.initializeSessionAndBrowser(profileAnswer === "use" ? profileName : undefined);
    const { session, windowInfo } = sessionAndWindow;

    if (profileAnswer === "create") {
      await service.saveProfileOnTermination(session.id, profileName);
    }

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
  if (e?.message?.includes("404")) {
    console.error("Profile name not found, please create a new profile or use an existing one.");
  }
  console.error(e);
  process.exit(1);
});
