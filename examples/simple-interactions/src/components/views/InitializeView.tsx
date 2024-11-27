import { StartForm } from "@/components/forms/StartForm";
import { Card, CardContent, CardHeader } from "@local/ui";

export function InitializeView() {
  return (
    <Card>
      {/* Empty header to provide extra padding */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" />
      <CardContent>
        <StartForm />
      </CardContent>
    </Card>
  );
}
