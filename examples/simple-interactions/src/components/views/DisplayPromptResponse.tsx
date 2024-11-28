import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
}

export function DisplayPromptResponse({ content }: DisplayPromptResponseProps) {
  return (
    <Card>
      <CardHeader className="flex flex-column items-start justify-between pb-2">
        <CardTitle>Scraped Data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto">{content}</pre>
      </CardContent>
    </Card>
  );
}
