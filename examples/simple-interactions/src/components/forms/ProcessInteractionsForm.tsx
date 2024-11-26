"use client";

import {
  type ProcessInteractionsRequest,
  type ProcessInteractionsResponse,
  processInteractionsRequestSchema,
} from "@/app/api/process-interactions/process-interactions.validation";
import { DEFAULT_STOCK_SYMBOL } from "@/consts";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ElapsedTime,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useHandleError,
} from "@local/ui";
import { getFetchBasePath } from "@local/utils";
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

/**
 * ProcessInteractionsForm Component
 * A form component that handles proccessing of interactions.
 * It collects an optional ticker from the user and makes a POST request
 * to start the interactions process.
 */
export function ProcessInteractionsForm() {
  // Get state management functions from the app store
  const setProcessInteractionsResponse = useAppStore((state) => state.setProcessInteractionsResponse);
  const apiKey = useAppStore((state) => state.apiKey);
  const response = useAppStore((state) => state.response);
  const handleError = useHandleError();

  // Initialize form with Zod validation schema
  const form = useForm<ProcessInteractionsRequest>({
    resolver: zodResolver(processInteractionsRequestSchema),
    defaultValues: {
      apiKey,
      ticker: DEFAULT_STOCK_SYMBOL,
      sessionId: response.sessionId,
      windowId: response.windowId,
    },
  });

  // Handle form submission
  const onSubmit = useCallback(async () => {
    try {
      const data = form.getValues();
      const response = await fetch(`${getFetchBasePath()}/api/process-interactions`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = (await response.json()) as ProcessInteractionsResponse;

      setProcessInteractionsResponse(result);
    } catch (e: any) {
      handleError({
        error: e,
        consoleLogMessage: "API call failed",
      });
    }
  }, [setProcessInteractionsResponse, handleError, form.getValues]);

  // Prevent the default form submission behavior which will refresh the page
  const preventDefault = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={preventDefault} className="space-y-6">
        <FormField
          name="ticker"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticker Symbol</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{processInteractionsRequestSchema.shape.ticker.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} onClick={onSubmit}>
          {form.formState.isSubmitting ? <ElapsedTime content="Working..." /> : "Search ticker"}
        </Button>
      </form>
    </Form>
  );
}
