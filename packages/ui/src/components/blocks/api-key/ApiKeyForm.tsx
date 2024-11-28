"use client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/index.js";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFetchBasePath } from "@local/utils";
import { type SetApiKeyRequest, setApiKeyRequestSchema } from "@local/utils/api/api-key/set-api-key.validation.js";
import type React from "react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

interface SetApiKeyFormProps {
  onError: (error: any) => void;
  onSuccess: (apiKey: string) => void;
  currentApiKey?: string;
  onRequestNewKey?: () => void;
}

export function ApiKeyForm({ onError, onSuccess, currentApiKey, onRequestNewKey }: SetApiKeyFormProps) {
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const form = useForm<SetApiKeyRequest>({
    resolver: zodResolver(setApiKeyRequestSchema),
    defaultValues: {
      apiKey: currentApiKey || "",
    },
  });

  // Handle form submission
  const onApiKeySubmit = useCallback(
    async (data: SetApiKeyRequest) => {
      try {
        const response = await fetch(`${getFetchBasePath()}/api/api-key`, {
          method: currentApiKey ? "DELETE" : "POST",
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }

        if (currentApiKey) {
          onSuccess("");
          return;
        }

        onSuccess(data.apiKey);
      } catch (e: any) {
        onError(e);
      }
    },
    [onError, onSuccess, currentApiKey],
  );

  // Prevent form default behavior and handle submission
  const handleSetApiKeySubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the default form submission behavior which will refresh the page
      form.handleSubmit(onApiKeySubmit)(event);
    },
    [form.handleSubmit, onApiKeySubmit],
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSetApiKeySubmit} className="space-y-6">
        <div className="flex gap-4">
          <FormField
            name="apiKey"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    className="mb-1"
                    readOnly={!!currentApiKey}
                    placeholder="Your Airtop API key"
                    type="text"
                    value={currentApiKey && !isApiKeyVisible ? "(Click to show API key)" : field.value}
                    onClick={() => currentApiKey && setIsApiKeyVisible(true)}
                    onBlur={() => setIsApiKeyVisible(false)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : `${currentApiKey ? "Unset" : "Set"} API Key`}
          </Button>
          {!currentApiKey && (
            <Button type="button" onClick={onRequestNewKey}>
              Get API Key
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
