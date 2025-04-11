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
import { z } from "zod";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  openAiKey: z.string().min(1, "OpenAI API Key is required"),
  urls: z.array(z.string().url("Must be a valid URL")).min(1, "At least one URL is required"),
});

type FormData = z.infer<typeof formSchema>;

export function StartForm() {
  // Store state management hooks
  const setOpenAiKey = useAppStore((state) => state.setOpenAiKey);
  const apiKey = useAppStore((state) => state.apiKey);
  const setUrls = useAppStore((state) => state.setUrls);
  const setStartResponse = useAppStore((state) => state.setStartResponse);
  const handleError = useHandleError();

  // Form initialization
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAiKey: "",
      apiKey,
      urls: ["https://www.findapsychologist.org/cities/psychologists-in-san-francisco/"],
    },
  });

  // URL management handlers
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

  // Form submission handlers
  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setOpenAiKey(data.openAiKey);
        setUrls(data.urls);

        const response = await fetch(`${getFetchBasePath()}/api/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw await response.json();
        }

        const result = await response.json();
        if (result.error) {
          throw result;
        }

        setStartResponse(result);
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
    [setOpenAiKey, setUrls, handleError, setStartResponse],
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void form.handleSubmit(onSubmit)(event);
    },
    [form.handleSubmit, onSubmit],
  );

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <OpenAiKeyField form={form} />
        <UrlsField form={form} addUrl={addUrl} removeUrl={removeUrl} />
        <SubmitButton form={form} />
      </form>
    </Form>
  );
}

// Component for OpenAI API Key field
function OpenAiKeyField({ form }: { form: any }) {
  return (
    <FormField
      name="openAiKey"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>OpenAI API Key</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input {...field} type="password" />
              <Button type="button" onClick={() => window.open("https://platform.openai.com/api-keys", "_blank")}>
                Get API Key
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Component for URLs field
function UrlsField({
  form,
  addUrl,
  removeUrl,
}: { form: any; addUrl: (url: string) => void; removeUrl: (url: string) => void }) {
  return (
    <FormField
      name="urls"
      control={form.control}
      render={() => (
        <FormItem>
          <FormLabel>URLs</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <UrlInput addUrl={addUrl} />
              <UrlList urls={form.watch("urls")} removeUrl={removeUrl} />
            </div>
          </FormControl>
          <FormDescription>Enter URLs and press Enter or click Add URL</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Component for URL input
function UrlInput({ addUrl }: { addUrl: (url: string) => void }) {
  return (
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
  );
}

// Component for URL list
function UrlList({ urls, removeUrl }: { urls: string[]; removeUrl: (url: string) => void }) {
  return (
    <div className="space-y-2">
      {urls.map((url) => (
        <div key={url} className="flex items-center gap-2">
          <span className="flex-1 text-sm truncate">{url}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeUrl(url)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

// Component for submit button
function SubmitButton({ form }: { form: any }) {
  return (
    <Button type="submit" disabled={form.formState.isSubmitting || form.watch("urls").length === 0} className="w-full">
      {form.formState.isSubmitting ? <ElapsedTime content="Processing..." /> : "Process URLs"}
    </Button>
  );
}
