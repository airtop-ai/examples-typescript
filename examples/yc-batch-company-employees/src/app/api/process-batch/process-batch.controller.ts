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
  parallelism,
  log,
}: ProcessBatchControllerParams): Promise<ProcessBatchResponse> {
  const { airtop, yCombinator, linkedin } = getServices(apiKey, log);

  try {
    // Get companies for the selected batch
    const companies = await yCombinator.getCompaniesInBatch(batch, sessionId);

    // Get LinkedIn profile urls for the companies
    const linkedInProfileUrls = await yCombinator.getCompaniesLinkedInProfileUrls(companies);

    const isLoggedIn = await linkedin.checkIfSignedIntoLinkedIn(sessionId);

    // If LinkedIn auth is needed, return the live view URL
    if (!isLoggedIn) {
      const liveViewUrl = await linkedin.getLinkedInLoginPageLiveViewUrl(sessionId);
      return {
        sessionId,
        content: "",
        signInRequired: true,
        liveViewUrl,
      };
    }

    // Get employee list url for each company
    const employeesListUrls = await linkedin.getEmployeesListUrls({
      companyLinkedInProfileUrls: linkedInProfileUrls,
      sessionId: sessionId,
      parallelism,
    });

    // Get employee's Profile Urls for each employee list url
    const employeesProfileUrls = await linkedin.getEmployeesProfileUrls({
      employeesListUrls: employeesListUrls,
      sessionId: sessionId,
      parallelism,
    });

    log.info("*** Batch operation completed, returning response to client ***");

    // Format the response
    return {
      sessionId,
      content: JSON.stringify(employeesProfileUrls, null, 2),
      signInRequired: false,
    };
  } finally {
    await airtop.terminateAllWindows();
    await airtop.terminateAllSessions();
  }
}
