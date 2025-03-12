import type { Therapist } from "@/graph/state";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";
import { useEffect } from "react";

interface DisplayTherapistsGridProps {
  therapists: Therapist[];
}

export function DisplayTherapistsGrid({ therapists }: DisplayTherapistsGridProps) {
  const apiKey = useAppStore((state) => state.apiKey);
  const openAiKey = useAppStore((state) => state.openAiKey);
  const setStartResponse = useAppStore((state) => state.setStartResponse);

  useEffect(() => {
    const continueProcessing = async () => {
      try {
        const response = await fetch("/api/continue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey,
            openAiKey,
            therapists,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process therapists");
        }

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        // Update the store with the CSV content
        setStartResponse(result);
      } catch (error) {
        console.error("Error processing therapists:", error);
      }
    };

    // Start processing after a short delay to allow the windows to be visible
    const timer = setTimeout(() => {
      void continueProcessing();
    }, 10000);

    return () => clearTimeout(timer);
  }, [apiKey, openAiKey, therapists, setStartResponse]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Processing Therapist Websites...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {therapists.slice(0, 4).map((therapist) => (
            <Card key={`${therapist.website ?? ""}-${therapist.name ?? ""}`} className="aspect-video">
              <iframe
                src={therapist.website}
                title={therapist.name || "Therapist website"}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
              />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
