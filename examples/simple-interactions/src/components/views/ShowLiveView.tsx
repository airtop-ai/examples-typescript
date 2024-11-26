import { Card, CardContent, CardHeader, CardTitle, LiveView } from "@local/ui";
import { ProcessInteractionsForm } from "../forms/ProcessInteractionsForm";

interface ShowLiveViewProps {
  liveViewUrl: string;
}

export function ShowLiveView({ liveViewUrl }: ShowLiveViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex">
            <LiveView liveViewUrl={liveViewUrl} />
          </div>
          <div className="flex mt-4">
            <ProcessInteractionsForm />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
