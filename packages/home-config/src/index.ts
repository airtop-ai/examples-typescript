import type { Header } from "next/dist/lib/load-custom-routes.js";

export interface ExampleListing {
  dirName: string;
  metadata: {
    title: string;
    description: string;
  };
}

export enum ExampleSite {
  LINKEDIN_DATA_EXTRACTION = "LINKEDIN_DATA_EXTRACTION",
  YC_BATCH_COMPANY_EMPLOYEES = "YC_BATCH_COMPANY_EMPLOYEES",
  CUSTOMER_REVIEWS = "CUSTOMER_REVIEWS",
  SIMPLE_INTERACTIONS = "SIMPLE_INTERACTIONS",
}

export const exampleListings: Record<ExampleSite, ExampleListing> = {
  [ExampleSite.LINKEDIN_DATA_EXTRACTION]: {
    dirName: "linkedin-data-extraction",
    metadata: {
      title: "Airtop: LinkedIn Data Extraction",
      description: "Extracts data from LinkedIn profiles",
    },
  },
  [ExampleSite.YC_BATCH_COMPANY_EMPLOYEES]: {
    dirName: "yc-batch-company-employees",
    metadata: {
      title: "Airtop: YC Batch Company's Employees's Profiles",
      description: "Extracts employees from YC batch companies",
    },
  },
  [ExampleSite.CUSTOMER_REVIEWS]: {
    dirName: "customer-reviews",
    metadata: {
      title: "Airtop: Restaurant reviews",
      description: "Reply to customer reviews",
    },
  },
  [ExampleSite.SIMPLE_INTERACTIONS]: {
    dirName: "simple-interactions",
    metadata: {
      title: "Airtop: Simple Browser Interactions",
      description: "Simple interactions with the browser",
    },
  },
};

export const registerToHome = (dirName: string) => {
  return {
    assetPrefix: `/${dirName}-static`,
  };
};

export const getAppUrl = (dirName: string) => {
  return `https://examples.airtop.ai/${dirName}`;
};

export const getHomeConfig = (dirName: string) => {
  const url = `https://${dirName}.examples.airtop.dev`;

  return [
    {
      source: `/${dirName}`,
      destination: url,
    },
    {
      source: `/${dirName}/:path*`,
      destination: `${url}/:path*`,
    },
    {
      source: `/${dirName}-static/:path*`,
      destination: `${url}/${dirName}-static/:path*`,
    },
  ];
};

export const getHeadersConfig = (additionalHeaders: Array<Header> = []) => {
  return {
    async headers() {
      return [
        {
          // matching all API routes
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          ],
        },
        ...additionalHeaders,
      ];
    },
  };
};
