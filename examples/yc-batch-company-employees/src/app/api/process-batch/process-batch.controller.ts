import type { ProcessBatchRequest, ProcessBatchResponse } from "@/app/api/process-batch/process-batch.validation";
import { getServices } from "@/lib/services";
import type { LogLayer } from "loglayer";

interface ProcessBatchControllerParams extends ProcessBatchRequest {
  log: LogLayer;
}

export async function processBatchController({
  apiKey,
  sessionId,
  batch,
  profileId,
  log,
}: ProcessBatchControllerParams): Promise<ProcessBatchResponse> {
  const { airtop, yCombinator, linkedin } = getServices(apiKey, log);

  try {
    // Get companies for the selected batch
    const companies = await yCombinator.getCompaniesInBatch(batch, sessionId);

    // Get LinkedIn profile urls for the companies
    const linkedInProfileUrls = await yCombinator.getCompaniesLinkedInProfileUrls(companies);

    // At this point we should be logged in, so we terminate the session to persist profile
    await airtop.terminateSession(sessionId);

    // Extra sleep to ensure the profile is persisted
    log.withMetadata({ now: Date.now() }).info("Sleeping for 30 seconds to ensure the profile is persisted...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    log.withMetadata({ now: Date.now() }).info("Done sleeping, continuing...");

    // Get employee list url for each company
    const employeesListUrls = await linkedin.getEmployeesListUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      profileId,
    });

    // Get employee's Profile Urls for each employee list url
    const employeesProfileUrls = await linkedin.getEmployeesProfileUrls({
      employeesListUrls: employeesListUrls,
      profileId,
    });

    log.info("*** Batch operation completed, returning response to client ***");

    // Format the response
    return {
      sessionId,
      content: JSON.stringify(employeesProfileUrls, null, 2),
      signInRequired: false,
    };
  } catch (err) {
    log.withError(err).error("Failed to extract LinkedIn data");

    return {
      sessionId,
      content: "",
    };
  } finally {
    log.debug("Final cleanup");
    await airtop.terminateSession(sessionId);
  }
}
