"use client";

import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ElapsedTime,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  Input,
  useHandleError,
} from "@local/ui";
import { getFetchBasePath } from "@local/utils";
import { useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";

export function StartForm() {
  const setStartResponse = useAppStore((state) => state.setStartResponse);
  const openAiKey = useAppStore((state) => state.openAiKey);
  const apiKey = useAppStore((state) => state.apiKey);
  const handleError = useHandleError();

  const form = useForm<StartRequest>({
    resolver: zodResolver(startRequestSchema),
    defaultValues: {
      openAiKey: openAiKey || "",
      urls: [""],
      apiKey: apiKey || "",
    },
  });

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

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.handleSubmit(onSubmit)(event);
    },
    [form, onSubmit],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          name="openAiKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenAI API Key</FormLabel>
              <FormControl>
                <Input placeholder="sk-..." {...field} />
              </FormControl>
              <FormDescription>
                Your OpenAI API key for content generation. Get one at{" "}
                <a href="https://platform.openai.com" className="text-blue-500 hover:underline">
                  platform.openai.com
                </a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <ElapsedTime content="Processing..." /> : "Start"}
        </Button>
      </form>
    </FormProvider>
  );
}
