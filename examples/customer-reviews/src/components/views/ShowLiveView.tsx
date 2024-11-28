import { LiveViewForm } from "@/components/forms/LiveViewForm";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, LiveView } from "@local/ui";

export function ShowLiveView() {
  const { liveViewUrl, profileId, signInRequired } = useAppStore((state) => state.session);
  const taskFulfillmentResponse = useAppStore((state) => state.taskFulfillment);

  const title = signInRequired ? "Sign in to Facebook in order to continue" : "";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {profileId && (
          <div className="mt-8 space-y-2">
            <h4 className="font-medium leading-none">Session's Profile ID</h4>
            <p className="text-sm text-muted-foreground">{profileId}</p>
          </div>
        )}
        <LiveViewForm />
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
