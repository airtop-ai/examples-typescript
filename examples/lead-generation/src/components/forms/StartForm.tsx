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
  Input,
  useHandleError,
} from "@local/ui";
import type React from "react";
import { useCallback } from "react";
import { Control, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  openAiKey: z.string().min(1, "OpenAI API Key is required"),
  urls: z.array(z.string().url("Must be a valid URL")).min(1, "At least one URL is required"),
});

type FormData = z.infer<typeof formSchema>;

export function StartForm() {
  const setApiKey = useAppStore((state) => state.setApiKey);
  const setOpenAiKey = useAppStore((state) => state.setOpenAiKey);
  const setUrls = useAppStore((state) => state.setUrls);
  const handleError = useHandleError();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
      openAiKey: "",
      urls: [],
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setApiKey(data.apiKey);
        setOpenAiKey(data.openAiKey);
        setUrls(data.urls);

        const response = await fetch("/api/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw await response.json();
        }

        const result = await response.json();
        if (result.error) {
          throw result;
        }
      } catch (e) {
        handleError({
          error: {
            type: "Error",
            error: e instanceof Error ? e : new Error("Failed to process URLs"),
          },
          consoleLogMessage: "Failed to process URLs",
        });
      }
    },
    [setApiKey, setOpenAiKey, setUrls, handleError],
  );

  const addUrl = useCallback(
    (url: string) => {
      const currentUrls = form.getValues("urls");
      if (url && !currentUrls.includes(url)) {
        form.setValue("urls", [...currentUrls, url]);
      }
    },
    [form],
  );

  const removeUrl = useCallback(
    (urlToRemove: string) => {
      const currentUrls = form.getValues("urls");
      form.setValue(
        "urls",
        currentUrls.filter((url) => url !== urlToRemove),
      );
    },
    [form],
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void form.handleSubmit(onSubmit)(event);
    },
    [form.handleSubmit, onSubmit],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
      <FormField
          name="apiKey"
          control={form.control as Control<FormData>} 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Airtop API Key</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="openAiKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenAI API Key</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="urls"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>URLs</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter URL"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          if (input.value) {
                            addUrl(input.value);
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value) {
                          addUrl(input.value);
                          input.value = "";
                        }
                      }}
                    >
                      Add URL
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.watch("urls").map((url) => (
                      <div key={url} className="flex items-center gap-2">
                        <span className="flex-1 text-sm truncate">{url}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeUrl(url)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>Enter URLs and press Enter or click Add URL</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || form.watch("urls").length === 0}
          className="w-full"
        >
          {form.formState.isSubmitting ? <ElapsedTime content="Processing..." /> : "Process URLs"}
        </Button>
      </form>
    </FormProvider>
  );
}
