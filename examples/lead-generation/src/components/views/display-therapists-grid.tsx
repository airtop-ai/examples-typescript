import type { Therapist } from "@/graph/state";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, ElapsedTime } from "@local/ui";
import { getFetchBasePath } from "@local/utils";
import { useEffect, useState } from "react";

interface DisplayTherapistsGridProps {
  therapists: Therapist[];
}

export function DisplayTherapistsGrid({ therapists }: DisplayTherapistsGridProps) {
  const apiKey = useAppStore((state) => state.apiKey);
  const openAiKey = useAppStore((state) => state.openAiKey);
  const setStartResponse = useAppStore((state) => state.setStartResponse);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const continueProcessing = async () => {
      setIsProcessing(true);
      try {
        const response = await fetch(`${getFetchBasePath()}/api/continue`, {
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

        setStartResponse(result);
      } catch (error) {
        console.error("Error processing therapists:", error);
      }
    };

    const timer = setTimeout(() => {
      void continueProcessing();
    }, 10000);

    return () => clearTimeout(timer);
  }, [apiKey, openAiKey, therapists, setStartResponse]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center space-y-4 pb-6">
        <CardTitle className="text-xl font-bold text-center">Processing Therapist Websites</CardTitle>
        <div className="text-center text-muted-foreground text-lg">
          <ElapsedTime content="Analyzing and generating personalized messages" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {therapists.slice(0, 4).map((therapist) => (
            <Card key={`${therapist.website ?? ""}-${therapist.name ?? ""}`} className="aspect-video">
              <iframe
                src={therapist.website}
                title={therapist.name || "Therapist website"}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onError={(e) => console.error("Failed to load iframe:", e)}
              />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
