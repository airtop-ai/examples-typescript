import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
  profileName?: string;
}

export function DisplayPromptResponse({ content, profileName }: DisplayPromptResponseProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraped Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto">{content}</pre>
        </CardContent>
      </Card>
      {profileName && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Name</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto">{profileName}</pre>
          </CardContent>
        </Card>
      )}
    </>
  );
}
