import { InProgressForm } from "@/components/forms/InProgressForm";
import { TerminateSession } from "@/components/ui/TerminateSession";
import { Card, CardContent, CardHeader, CardTitle, LiveView } from "@local/ui";

interface ShowLiveViewProps {
  liveViewUrl: string;
}

export function ShowLiveView({ liveViewUrl }: ShowLiveViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Live View</CardTitle>
        <TerminateSession />
      </CardHeader>
      <CardContent className="flex justify-between">
        <div className="w-[80%] overflow-x-scroll">
          <LiveView className="w-[1920px]" liveViewUrl={liveViewUrl} height="900px" />
        </div>
        <div className="w-[20%]">
          <InProgressForm />
        </div>
      </CardContent>
    </Card>
  );
}
