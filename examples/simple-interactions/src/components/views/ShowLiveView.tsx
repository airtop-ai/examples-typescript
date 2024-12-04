import { Card, CardContent, LiveView } from "@local/ui";
import { ProcessInteractionsForm } from "../forms/ProcessInteractionsForm";

interface ShowLiveViewProps {
  liveViewUrl: string;
}

export function ShowLiveView({ liveViewUrl }: ShowLiveViewProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex mt-4">
            <ProcessInteractionsForm />
          </div>
          <div className="flex mt-4">
            <LiveView liveViewUrl={liveViewUrl} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
