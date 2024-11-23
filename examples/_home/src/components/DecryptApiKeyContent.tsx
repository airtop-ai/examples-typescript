"use client";

import { useEffect } from "react";

const AIRTOP_PORTAL_URL = process.env.NEXT_PUBLIC_AIRTOP_PORTAL_URL;

interface DecryptApiKeyContentProps {
  csrf: string;
}

export function DecryptApiKeyContent({ csrf }: DecryptApiKeyContentProps) {
  useEffect(() => {
    // Handle incoming messages from parent window
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin for security
      if (event.origin !== AIRTOP_PORTAL_URL) {
        return;
      }

      // Handle the message data
      const { type, data } = event.data;

      // Add your message handling logic here
      switch (type) {
        case "SET_API_KEY":
          // Decrypt the API key and set to session cookie
          fetch("/api/decrypt-api-key", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              secret: data.secret,
              nonce: data.nonce,
              csrf,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to set API key");
              }
              // Notify parent of success
              window.parent.postMessage({ type: "API_KEY_SET_SUCCESS" }, AIRTOP_PORTAL_URL);
            })
            .catch((error) => {
              // Notify parent of failure
              window.parent.postMessage({ type: "API_KEY_SET_ERROR", error: error.message }, AIRTOP_PORTAL_URL);
            });
          break;
        default:
          console.error("Unknown message type:", type);
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Clean up on unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [csrf]);

  return <div />;
}
