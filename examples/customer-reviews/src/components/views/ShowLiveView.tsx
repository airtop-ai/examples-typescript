import { LiveViewForm } from "@/components/forms/LiveViewForm";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, LiveView } from "@local/ui";

export function ShowLiveView() {
  const { liveViewUrl, signInRequired } = useAppStore((state) => state.session);
  const taskFulfillmentResponse = useAppStore((state) => state.taskFulfillment);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {!taskFulfillmentResponse.accomplished && <LiveViewForm />}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="mt-8">{liveViewUrl && <LiveView liveViewUrl={liveViewUrl} height="900px" />}</div>
          <div className="pt-4">
            <pre className="overflow-auto p-8">Result: {JSON.stringify(taskFulfillmentResponse)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
