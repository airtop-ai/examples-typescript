import { Button, Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
  profileName?: string;
  tryAgain?: () => void;
}

export function DisplayPromptResponse({ content, profileName, tryAgain }: DisplayPromptResponseProps) {
  return (
    <Card>
      <CardHeader className="flex flex-column items-start justify-between pb-2">
        {tryAgain && (
          <Button variant="default" onClick={tryAgain}>
            Try Again
          </Button>
        )}
        <CardTitle>Profile Name: {profileName}</CardTitle>
        <CardTitle>Scraped Data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto">{content}</pre>
      </CardContent>
    </Card>
  );
}
