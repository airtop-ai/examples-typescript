export const serverEnvs = {
  /**
   * The secret used to secure the data for the session cookie.
   */
  cookieSecret: process.env.EXAMPLES_SITES_COOKIE_SECRET as string,
  /**
   * The domain to set the session cookie on.
   */
  cookieDomain: process.env.COOKIE_DOMAIN as string,
  /**
   * If true, enables generating the API key from the Airtop Portal and passing
   * it back to the example site to store into a cookie
   */
  enableGetApiKeyFromPortal: process.env.ENABLE_GET_API_KEY_FROM_PORTAL === "true",
  /**
   * The URL to the Airtop Portal
   */
  airtopPortalUrl: process.env.AIRTOP_PORTAL_URL as string,
};
