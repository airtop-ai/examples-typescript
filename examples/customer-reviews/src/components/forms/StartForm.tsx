"use client";

import { type StartRequest, startRequestSchema } from "@/app/api/start/start.validation";
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
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

/**
 * StartForm Component
 * A form component that handles session's task initialization.
 * It collects an API key and profile name from the user and makes a POST request
 * to start Airtop's session.
 */
export function StartForm() {
  // Get state management functions from the app store
  const apiKey = useAppStore((state) => state.apiKey);
  const requestSessionStart = useAppStore((state) => state.requestSessionStart);
  const setFulfillmentResponse = useAppStore((state) => state.setFulfillmentResponse);
  const requestFulfillTask = useAppStore((state) => state.requestFulfillTask);
  const setFetching = useAppStore((state) => state.setFetching);
  const handleError = useHandleError();

  // Initialize form with Zod validation schema
  const form = useForm<StartRequest>({
    resolver: zodResolver(startRequestSchema),
    defaultValues: {
      apiKey,
      profileName: "",
    },
  });

  // Handle form submission
  const onSubmit = useCallback(
    async (data: StartRequest) => {
      try {
        // Make request to start the session
        setFulfillmentResponse({});
        const { signInRequired, sessionId, windowId, targetId, cdpWsUrl } = await requestSessionStart(data);

        if (signInRequired) {
          return;
        }

        // If user is already signed-in, continue with the task
        await requestFulfillTask({
          apiKey,
          sessionId: sessionId!,
          windowId: windowId!,
          targetId: targetId!,
          cdpWsUrl: cdpWsUrl!,
        });
      } catch (e: any) {
        setFetching(false);
        handleError({
          error: e,
          consoleLogMessage: "API call failed",
        });
      }
    },
    [apiKey, requestSessionStart, requestFulfillTask, setFulfillmentResponse, setFetching, handleError],
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
        <FormField
          name="profileName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{startRequestSchema.shape.profileName.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <ElapsedTime content="Starting..." /> : "Start"}
        </Button>
      </form>
    </Form>
  );
}
