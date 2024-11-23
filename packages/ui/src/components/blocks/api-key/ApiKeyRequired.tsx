import { Card, CardContent, CardHeader, CardTitle } from "@/components/index.js";

export function ApiKeyRequired() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Required</CardTitle>
      </CardHeader>
      <CardContent>An API key is required to try this example.</CardContent>
    </Card>
  );
}
