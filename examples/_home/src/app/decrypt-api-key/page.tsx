import { DecryptApiKeyContent } from "@/components/DecryptApiKeyContent";
import { generateCsrfCookie } from "@local/utils";

/**
 * This page is used to set the API key in the session cookie.
 * It is designed to be embedded in the Airtop Portal as an iframe,
 * where the Airtop Portal will communicate the encrypted API key to this page
 * to be submitted to the decrypt-api-key endpoint to store the API key into the
 * session cookie.
 */
export default async function ApiKeyPage() {
  const csrf = await generateCsrfCookie();

  return <DecryptApiKeyContent csrf={csrf} />;
}
