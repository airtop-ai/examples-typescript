interface LiveViewProps {
  liveViewUrl: string;
  height?: string;
}

export function LiveView({ liveViewUrl, height = "500px" }: LiveViewProps) {
  return (
    <iframe
      className="w-full border"
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
