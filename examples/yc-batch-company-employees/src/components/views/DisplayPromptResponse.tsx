import { Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayPromptResponseProps {
  content: string;
  profileId?: string;
}

export function DisplayPromptResponse({ content, profileId }: DisplayPromptResponseProps) {
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
      {profileId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile ID</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto">{profileId}</pre>
          </CardContent>
        </Card>
      )}
    </>
  );
}
