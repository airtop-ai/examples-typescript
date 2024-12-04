import { StartForm } from "@/components/forms/StartForm";
import { Card, CardContent } from "@local/ui";

export function InitializeView() {
  return (
    <Card>
      <CardContent className="mt-4">
        <StartForm />
      </CardContent>
    </Card>
  );
}
