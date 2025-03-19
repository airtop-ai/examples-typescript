import type { StateAnnotation } from "@/graph/state";
import { getLogger } from "@local/utils";

export const CSV_GENERATOR_NODE_NAME = "csv-generator-node";

/**
 * Langgraph Node: Generate a CSV file from the therapists state.
 * @param state - The therapists state.
 * @returns The updated state with the CSV file path and content.
 */
export const csvGeneratorNode = async (state: typeof StateAnnotation.State) => {
  const log = getLogger().withPrefix("[csvGeneratorNode]");
  log.debug("Generating CSV file");

  const columns = ["name", "email", "phone", "website", "source", "message"];
  let csvContent = `${columns.join(",")}\n`;

  state.therapists.forEach((therapist) => {
    // Wrap name and message in quotes to properly escape them
    const escapedName = `"${therapist.name?.replace(/"/g, '""')}"`;
    const escapedMessage = `"${therapist.outreachMessage?.replace(/"/g, '""')}"`;

    csvContent += `${escapedName},${therapist.email},${therapist.phone},${therapist.website},${therapist.source},${escapedMessage}\n`;
  });

  log.info("CSV Content successfully generated");

  return {
    ...state,
    csvContent,
  };
};
