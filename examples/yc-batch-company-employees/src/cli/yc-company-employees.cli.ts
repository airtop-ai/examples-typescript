import { AirtopService } from "@/lib/services/airtop.service";
import { LinkedInExtractorService } from "@/lib/services/linkedin-extractor.service";
import { YCExtractorService } from "@/lib/services/yc-extractor.service";
import type { SessionResponse } from "@airtop/sdk/api";
import { confirm, input, select } from "@inquirer/prompts";
import { getLogger } from "@local/utils";

/**
 * Command line example that uses Airtop to extract data from LinkedIn.
 */
async function cli() {
  const log = getLogger();

  const apiKey = await input({
    message: "Enter your Airtop API key:",
    required: true,
  });

  const profileName = await input({
    message: "Enter a browser profile name to use:",
    required: true,
  });

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

  try {
    ycSession = await ycService.airtop.createSession(profileName);

    log.info(`Profile "${profileName}" will be saved on session termination.`);
    await airtop.client.sessions.saveProfileOnTermination(ycSession.data.id, profileName);

    const batches = await ycService.getYcBatches(ycSession.data.id);

    const selectedBatch = await select({
      message: "Select a batch:",
      choices: batches.map((batch) => ({ name: batch, value: batch })),
    });

    const companies = await ycService.getCompaniesInBatch(selectedBatch, ycSession.data.id);

    log.withMetadata(companies).info("Now we will extract the LinkedIn profile urls from the companies");

    log.info("This might take a while...");

    const linkedInProfileUrls = await ycService.getCompaniesLinkedInProfileUrls(companies);

    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(ycSession.data.id);

    if (!isLoggedIn) {
      const linkedInLoginPageUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(ycSession.data.id);

      log.info("Please sign in to LinkedIn using this live view URL in your browser:");
      log.info(linkedInLoginPageUrl);

      await confirm({ message: "Press enter once you have signed in", default: true });

      log.info("You can now close the browser tab for the live view. The extraction will continue in the background.");

      // Terminate the session to save the profile
      await airtop.terminateSession(ycSession.data.id);
    }

    const employeesListUrls = await linkedInService.getEmployeesListUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      profileName,
    });

    await linkedInService.getEmployeesProfileUrls({
      employeesListUrls: employeesListUrls,
      profileName,
    });

    log.info("*** Operation finished ***");
  } catch (err) {
    log.error(`Error occurred in main script: ${err}`);
  } finally {
    log.debug("Final cleanup");
    airtop.terminateSession(ycSession?.data.id).catch((e) => {
      log.error(`Error occurred in final cleanup: ${e}`);
    });
  }

  process.exit(0);
}

cli().catch((e) => {
  console.error(e);
  process.exit(1);
});
