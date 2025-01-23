import { metadata } from "@/app/layout";
import { MainContent } from "@/components/MainContent";
import { PageHeader } from "@local/ui";
import { getApiKeyFromCookie } from "@local/utils";
import { cookies } from "next/headers";

/**
 * The main page of the application.
 */
export default async function MainPage() {
  const nextCookies = await cookies();
  const currentApiKey = await getApiKeyFromCookie(nextCookies);

  return (
    <>
      <div className="flex-col">
        <PageHeader title={metadata.title! as string} description={metadata.description!} />
      </div>
      <MainContent currentApiKey={currentApiKey} />
    </>
  );
}
