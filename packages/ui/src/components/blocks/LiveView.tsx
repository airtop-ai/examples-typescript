import { cn } from "@/lib/utils.js";

interface LiveViewProps {
  liveViewUrl: string;
  height?: string;
  className?: string;
}

export function LiveView({ liveViewUrl, className, height = "1000px" }: LiveViewProps) {
  return (
    <iframe
      className={cn("w-full border", className)}
      allow="clipboard-read;clipboard-write;"
      title="Airtop Live View"
      id="airtop-live-view"
      src={liveViewUrl}
      style={{
        height,
      }}
    />
  );
}
