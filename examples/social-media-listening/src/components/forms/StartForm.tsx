"use client";

import { useStartSession } from "@/app/hooks";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Slider,
} from "@local/ui";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  profileId: z.string().optional(),
  resultLimit: z.number().min(1).max(10),
  matchPrompt: z.string().min(3, { message: "Match prompt is required" }),
  replyPrompt: z.string().min(3, { message: "Reply prompt is required" }),
  query: z.string().min(3, { message: "Query is required" }),
});

/**
 * StartForm Component
 * A form component that handles browser interactions initialization.
 * It collects an API key and profile ID from the user and makes a POST request
 * to start the interactions process.
 */
export function StartForm() {
  const profileId = useAppStore((state) => state.profileId);
  const setProfileId = useAppStore((state) => state.setProfileId);
  const setTaskParams = useAppStore((state) => state.setTaskParams);

  const { startSession, isLoading } = useStartSession();

  const saveProfileId = (profileId: string) => {
    const id = (profileId || "").trim();
    localStorage.setItem("AIRTOP_PROFILE_ID", id);
    setProfileId(id);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: localStorage.getItem("AIRTOP_PROFILE_ID") || profileId,
      resultLimit: 3,
      query: "",
      matchPrompt: "",
      replyPrompt: "",
    },
  });

  const onSubmit = ({ profileId, ...rest }: z.infer<typeof formSchema>) => {
    setTaskParams({ ...rest });
    saveProfileId(profileId || "");
    startSession({ profileId, ...rest });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit(onSubmit)(event);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="profileId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Airtop Profile ID</FormLabel>
              <FormControl>
                <Input placeholder="abcd-efg2-hij3-klm4" {...field} onBlur={(e) => saveProfileId(e.target.value)} />
              </FormControl>
              <FormDescription>The ID of the Airtop profile to use for the session.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Query</FormLabel>
              <FormControl>
                <Input placeholder="E.g. #ai #agents #langchain" {...field} />
              </FormControl>
              <FormDescription>The query to use in the search bar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="matchPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match Prompt</FormLabel>
              <FormControl>
                <Input placeholder="E.g. The author shares a project or tool regarding AI frameworks" {...field} />
              </FormControl>
              <FormDescription>The criteria to use to find posts to reply to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="replyPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reply Prompt</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g. Friendly response addressing the original post and recommending Airtop"
                  {...field}
                />
              </FormControl>
              <FormDescription>The way in which the reply should be written.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="resultLimit"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>
                Result Limit: <span className="text-sm text-gray-500">{value}</span>
              </FormLabel>
              <Slider
                className="w-[60%]"
                defaultValue={[5]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => onChange(value)}
                {...field}
              />
              <FormDescription>
                The number of posts to extract. The bigger the number the longer it will take to finish.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Please wait...
            </>
          ) : (
            "Start"
          )}
        </Button>
      </form>
    </Form>
  );
}
