import { Button, Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
  tryAgain?: () => void;
}

export function DisplayPromptResponse({ content, tryAgain }: DisplayPromptResponseProps) {
  return (
    <>
      <div>
        <Button onClick={tryAgain}>Try Again</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-column items-start justify-between pb-2">
          <CardTitle>Scraped Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto">{content}</pre>
        </CardContent>
      </Card>
    </>
  );
}
