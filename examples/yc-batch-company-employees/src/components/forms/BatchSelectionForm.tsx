import { useAppStore } from "@/store";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ElapsedTime,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useHandleError,
} from "@local/ui";
import { getLogger } from "@local/utils";
import { useCallback, useState } from "react";

interface BatchSelectorFormProps {
  batches: string[];
}

export function BatchSelectorForm({ batches }: BatchSelectorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parallelSessions, setParallelSessions] = useState<number>(1);
  const apiKey = useAppStore((state) => state.apiKey);
  const sessionId = useAppStore((state) => state.response.sessionId);
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
      const response = await fetch("api/process-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          batch: selectedBatch,
          sessionId,
          parallelism: parallelSessions,
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
  }, [selectedBatch, apiKey, sessionId, setProcessBatchResponse, handleError, parallelSessions]);

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

          <div>
            <Label>Number of sessions to use for batch processing</Label>
            <Select
              value={parallelSessions.toString()}
              onValueChange={(value) => setParallelSessions(Number.parseInt(value))}
            >
              <SelectTrigger className="w-full p-2 border rounded-md bg-background mt-1">
                <SelectValue placeholder={"Number of sessions to use for batch processing"} />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3"].map((parallelism) => (
                  <SelectItem key={parallelism} value={parallelism}>
                    {parallelism} {parallelism === "1" ? "session (recommended for free-tier orgs)" : "sessions"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleBatchSelect} disabled={!selectedBatch || isSubmitting}>
            {isSubmitting ? <ElapsedTime content="Fetching employee profiles..." /> : "Process Batch"}
          </Button>
          <div className="italic">This operation will take a few minutes to complete.</div>
        </div>
      </CardContent>
    </Card>
  );
}
