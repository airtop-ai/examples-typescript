import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayErrorProps {
  error: string;
}

export function DisplayError({ error }: DisplayErrorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-destructive">Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{error}</p>
      </CardContent>
    </Card>
  );
}
