import { Button, Card, CardContent, CardHeader, CardTitle } from "@local/ui";

interface DisplayCsvContentProps {
  content: string;
}

export function DisplayCsvContent({ content }: DisplayCsvContentProps) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead-generation-results.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Generated Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[400px] overflow-auto p-4 bg-muted rounded-md">
          <pre className="text-sm">{content}</pre>
        </div>
        <Button onClick={handleDownload}>Download CSV</Button>
      </CardContent>
    </Card>
  );
}
