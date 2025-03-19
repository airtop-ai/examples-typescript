"use client";

import { DisplayCsvContent } from "@/components/views/display-csv-content";
import { DisplayError } from "@/components/views/display-errors";
import { DisplayTherapistsGrid } from "@/components/views/display-therapists-grid";
import { InitializeView } from "@/components/views/initialize-view";
import { useAppStore } from "@/store";
import { ApiKeyRequired } from "@local/ui";
import { useEffect } from "react";

interface MainContentProps {
  currentApiKey?: string;
}

export function MainContent({ currentApiKey }: MainContentProps) {
  const setApiKey = useAppStore((state) => state.setApiKey);
  const apiKey = useAppStore((state) => state.apiKey);
  const csvContent = useAppStore((state) => state.csvContent);
  const error = useAppStore((state) => state.error);
  const therapists = useAppStore((state) => state.therapists);

  useEffect(() => {
    if (!apiKey && currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, [currentApiKey, apiKey, setApiKey]);

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

  // Show error if present
  if (error) {
    return <DisplayError error={error} />;
  }

  // Show CSV content if available
  if (csvContent) {
    return <DisplayCsvContent content={csvContent} />;
  }

  // Show therapist grid if therapists are available
  if (therapists && therapists.length > 0) {
    return <DisplayTherapistsGrid therapists={therapists} />;
  }

  // Default view - show initialization form
  return <InitializeView />;
}
