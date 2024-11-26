import { StartForm } from "@/components/forms/StartForm";
import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

export function InitializeView() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <StartForm />
      </CardContent>
    </Card>
  );
}
