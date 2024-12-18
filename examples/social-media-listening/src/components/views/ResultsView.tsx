import { PostList } from "@/components/ui/PostList";
import { useAppStore } from "@/store";
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardHeader, CardTitle } from "@local/ui";

export function ResultsView() {
  const { result, extractedPosts, generatedReply } = useAppStore();
  const resetState = useAppStore((state) => state.resetState);

  const SuccessReport = () => {
    return (
      <div className="flex">
        <div className="min-w-80 p-8 border-r">
          <p className="text-md font-semibold mb-4">Extracted {extractedPosts.length} posts</p>
          <PostList posts={extractedPosts} />
        </div>
        <div className="p-8">
          <p className="text-md font-semibold mb-4">✅ Reply sent!</p>
          <p className="p-4 border rounded-xl italic">{generatedReply}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Result View</CardTitle>
        <Button variant="outline" onClick={resetState}>
          Start Over
        </Button>
      </CardHeader>
      <CardContent>
        {result.error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
        {result.success && <SuccessReport />}
      </CardContent>
    </Card>
  );
}
