import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
  profileId?: string;
}

export function DisplayPromptResponse({ content, profileId }: DisplayPromptResponseProps) {
  return (
    <Card>
      <CardHeader className="flex flex-column items-start justify-between pb-2">
        <CardTitle>Profile ID: {profileId}</CardTitle>
        <CardTitle>Scraped Data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto">{content}</pre>
      </CardContent>
    </Card>
  );
}
