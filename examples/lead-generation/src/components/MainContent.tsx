"use client";

import { DisplayCsvContent } from "@/components/views/DisplayCsvContent";
import { DisplayError } from "@/components/views/DisplayError";
import { InitializeView } from "@/components/views/InitializeView";
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

  // Default view - show initialization form
  return <InitializeView />;
}
