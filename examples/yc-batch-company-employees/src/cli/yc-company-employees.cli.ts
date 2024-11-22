import { AirtopService } from "@/lib/services/airtop.service";
import { LinkedInExtractorService } from "@/lib/services/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/services/yc-extractor.service";
import type { SessionResponse } from "@airtop/sdk/api";
import { confirm, input, select } from "@inquirer/prompts";
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

  const parallelism = Number.parseInt(
    await input({
      message: "Enter the number of parallel sessions to run:",
      default: "1",
      required: true,
      validate: (input) => {
        if (Number.isNaN(input) || Number.parseInt(input) < 1) {
          return "Please enter a valid number greater than 0";
        }

        return true;
      },
    }),
  );

  const airtop = new AirtopService({ apiKey, log });

  const ycService = new YCExtractorService({
    airtop,
    log,
  });

  const linkedInService = new LinkedInExtractorService({
    airtop,
    log,
  });

  let ycSession: SessionResponse | undefined;
  let linkedInSession: SessionResponse | undefined;

  try {
    ycSession = await ycService.airtop.createSession();
    const batches = await ycService.getYcBatches(ycSession.data.id);

    const selectedBatch = await select({
      message: "Select a batch:",
      choices: batches.map((batch) => ({ name: batch, value: batch })),
    });

    const companies = await ycService.getCompaniesInBatch(selectedBatch, ycSession.data.id);

    log.withMetadata(companies).info("Now we will extract the LinkedIn profile urls from the companies");

    log.info("This might take a while...");

    const linkedInProfileUrls = await ycService.getCompaniesLinkedInProfileUrls(companies.slice(0, 5));

    linkedInSession = await linkedInService.airtop.createSession(profileId);
    log.withMetadata({ profileId: linkedInSession.data.profileId }).info("Profile id");

    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(linkedInSession.data.id);

    if (!isLoggedIn) {
      const linkedInLoginPageUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(linkedInSession.data.id);

      log.info("Please sign in to LinkedIn using this live view URL in your browser:");
      log.info(linkedInLoginPageUrl);

      await confirm({ message: "Press enter once you have signed in", default: true });

      log.info("You can now close the browser tab for the live view. The extraction will continue in the background.");
    }

    const employeesListUrls = await linkedInService.getEmployeesListUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      sessionId: linkedInSession.data.id,
      parallelism,
    });

    await linkedInService.getEmployeesProfileUrls({
      employeesListUrls: employeesListUrls,
      sessionId: linkedInSession.data.id,
      parallelism,
    });

    log.info("*** Operation finished ***");
  } finally {
    // Cleanup
    await airtop.terminateAllWindows();
    await airtop.terminateAllSessions();
  }

  process.exit(0);
}

cli().catch((e) => {
  console.log(chalk.red("An error occurred"));
  console.error(e);
  process.exit(1);
});
