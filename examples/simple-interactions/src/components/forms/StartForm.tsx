"use client";

import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ElapsedTime, Form, useHandleError } from "@local/ui";
import { getFetchBasePath } from "@local/utils";
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

/**
 * StartForm Component
 * A form component that handles browser interactions initialization.
 * It collects an API key and profile ID from the user and makes a POST request
 * to start the interactions process.
 */
export function StartForm() {
  // Get state management functions from the app store
  const setStartResponse = useAppStore((state) => state.setStartResponse);
  const apiKey = useAppStore((state) => state.apiKey);
  const handleError = useHandleError();

  // Initialize form with Zod validation schema
  const form = useForm<StartRequest>({
    resolver: zodResolver(startRequestSchema),
    defaultValues: {
      apiKey,
    },
  });

  // Handle form submission
  const onSubmit = useCallback(
    async (data: StartRequest) => {
      try {
        const response = await fetch(`${getFetchBasePath()}/api/start`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }

        const result = (await response.json()) as StartResponse;
        setStartResponse(result);
      } catch (e: any) {
        handleError({
          error: e,
          consoleLogMessage: "API call failed",
        });
      }
    },
    [setStartResponse, handleError],
  );

  // Prevent form default behavior and handle submission
  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the default form submission behavior which will refresh the page
      form.handleSubmit(onSubmit)(event);
    },
    [form.handleSubmit, onSubmit],
  );

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <ElapsedTime content="Working..." /> : "Start"}
        </Button>
      </form>
    </Form>
  );
}
