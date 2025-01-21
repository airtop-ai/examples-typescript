import fs from "node:fs";
import type { TherapistState } from "@/graph/state.js";
import { getLogger } from "@local/utils";

export const CSV_GENERATOR_NODE_NAME = "csv-generator";

/**
 * Langgraph Node: Generate a CSV file from the therapists state.
 * @param state - The therapists state.
 * @returns Void (it writes to a file and saves it locally)
 */
export const csvGeneratorNode = async (state: TherapistState) => {
  const log = getLogger();

  const CSV_FILE_NAME = "therapists.csv";
  const columns = ["name", "email", "phone", "website", "source", "message"];
  let csvContent = `${columns.join(",")}\n`;

  state.therapists.forEach((therapist) => {
    // Wrap name and message in quotes to properly escape them
    const escapedName = `"${therapist.name?.replace(/"/g, '""')}"`;
    const escapedMessage = `"${therapist.outreachMessage?.replace(/"/g, '""')}"`;

    csvContent += `${escapedName},${therapist.email},${therapist.phone},${therapist.website},${therapist.source},${escapedMessage}\n`;
  });

  fs.writeFileSync(CSV_FILE_NAME, csvContent);

  log.info(`CSV file ${CSV_FILE_NAME} created successfully`);
  log.info(`File location: ${process.cwd()}/${CSV_FILE_NAME}`);

  return state;
};
