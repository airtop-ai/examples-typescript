import { useAppStore } from "@/store";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ElapsedTime,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useHandleError,
} from "@local/ui";
import { getFetchBasePath, getLogger } from "@local/utils";
import { useCallback, useState } from "react";

interface BatchSelectorFormProps {
  batches: string[];
}

export function BatchSelectorForm({ batches }: BatchSelectorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiKey = useAppStore((state) => state.apiKey);
  const sessionId = useAppStore((state) => state.response.sessionId);
  const profileName = useAppStore((state) => state.response.profileName);
  const setProcessBatchResponse = useAppStore((state) => state.setProcessBatchResponse);
  const selectedBatch = useAppStore((state) => state.selectedBatch);
  const setSelectedBatch = useAppStore((state) => state.setSelectedBatch);
  // Add the error handler hook
  const handleError = useHandleError();

  const handleBatchSelect = useCallback(async () => {
    const log = getLogger().withPrefix("[BatchSelectionForm]");

    if (!selectedBatch || !sessionId) {
      log.withMetadata({ selectedBatch, sessionId }).error("Missing required data");
      return;
    }

    setIsSubmitting(true);
    try {
      log.info("Sending request to api/process-batch");
      const response = await fetch(`${getFetchBasePath()}/api/process-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          batch: selectedBatch,
          sessionId,
          profileName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      log.info("Success response:", result);
      setProcessBatchResponse(result);
    } catch (e: any) {
      handleError({
        error: e,
        consoleLogMessage: "Failed to process batch",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBatch, apiKey, sessionId, setProcessBatchResponse, handleError, profileName]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Select YC Batch to pick companies from</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Select value={selectedBatch} onValueChange={(value) => setSelectedBatch(value)}>
            <SelectTrigger className="w-full p-2 border rounded-md bg-background">
              <SelectValue placeholder={"Select a batch..."} />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleBatchSelect} disabled={!selectedBatch || isSubmitting}>
            {isSubmitting ? <ElapsedTime content="Fetching employee profiles..." /> : "Process Batch"}
          </Button>
          <div className="italic">This operation will take a few minutes to complete.</div>
        </div>
      </CardContent>
    </Card>
  );
}
