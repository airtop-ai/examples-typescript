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

  const profileId = await input({
    message: "(optional) Enter a browser profile ID to use:",
    required: false,
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
    ycSession = await ycService.airtop.createSession(profileId);
    const batches = await ycService.getYcBatches(ycSession.data.id);

    const selectedBatch = await select({
      message: "Select a batch:",
      choices: batches.map((batch) => ({ name: batch, value: batch })),
    });

    const companies = await ycService.getCompaniesInBatch(selectedBatch, ycSession.data.id);

    log.withMetadata(companies).info("Now we will extract the LinkedIn profile urls from the companies");

    log.info("This might take a while...");

    const linkedInProfileUrls = await ycService.getCompaniesLinkedInProfileUrls(companies);

    log.withMetadata({ profileId: ycSession.data.profileId }).info("Profile id");

    const isLoggedIn = await linkedInService.checkIfSignedIntoLinkedIn(ycSession.data.id);

    let latestProfileId: string | undefined = profileId;
    if (!isLoggedIn) {
      const linkedInLoginPageUrl = await linkedInService.getLinkedInLoginPageLiveViewUrl(ycSession.data.id);

      log.info("Please sign in to LinkedIn using this live view URL in your browser:");
      log.info(linkedInLoginPageUrl);

      await confirm({ message: "Press enter once you have signed in", default: true });

      log.info("You can now close the browser tab for the live view. The extraction will continue in the background.");

      // Update latest profile id
      latestProfileId = ycSession.data.profileId;
      log.info(`Latest profile id: ${latestProfileId}`);
    }

    if (!latestProfileId) {
      throw new Error("No LinkedIn profile ID found, cannot continue");
    }

    // Terminate session to persist profile
    await airtop.terminateSession(ycSession.data.id);

    // Extra sleep to ensure the profile is persisted
    log.withMetadata({ now: Date.now() }).info("Sleeping for 30 seconds to ensure the profile is persisted...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    log.withMetadata({ now: Date.now() }).info("Done sleeping, continuing...");

    const employeesListUrls = await linkedInService.getEmployeesListUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      profileId: latestProfileId,
    });

    await linkedInService.getEmployeesProfileUrls({
      employeesListUrls: employeesListUrls,
      profileId: latestProfileId,
    });

    log.info("*** Operation finished ***");
  } catch (err) {
    log.error(`Error occurred in main script: ${err}`);
  } finally {
    log.debug("Final cleanup");
    await airtop.terminateSession(ycSession?.data.id);
  }

  process.exit(0);
}

cli().catch((e) => {
  console.error(e);
  process.exit(1);
});
