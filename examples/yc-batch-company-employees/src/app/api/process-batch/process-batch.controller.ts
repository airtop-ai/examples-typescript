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
  profileName,
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

    // Get employee's Profile Urls for each company
    const employeesProfileUrls = await linkedin.getEmployeesProfileUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      profileName,
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
    airtop.terminateSession(sessionId).catch((e) => {
      log.error(`Error occurred in final cleanup: ${e}`);
    });
  }
}
