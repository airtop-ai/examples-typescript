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
  SOCIAL_MEDIA_LISTENING = "SOCIAL_MEDIA_LISTENING",
  LEAD_GENERATION = "LEAD_GENERATION",
}

export const exampleListings: Record<ExampleSite, ExampleListing> = {
  [ExampleSite.LINKEDIN_DATA_EXTRACTION]: {
    dirName: "linkedin-data-extraction",
    metadata: {
      title: "LinkedIn Data Extraction",
      description: `This example showcases how to use Airtop's AI APIs to extract data from LinkedIn profiles. 
      When you first run this example, you will be prompted to sign in to LinkedIn. Once you have signed in, 
      you will be able to continue extracting data from a profile (we hardcoded our CEO's profiles for this example, but you can [take the code from the repo](https://github.com/airtop-ai/examples-typescript/tree/main/examples/linkedin-data-extraction) and extract data from any LinkedIn profile).
      Once you've logged in once, you can take the profileId and re-use it to extract data from the same profile without the need to sign in again. This shows how we can store profile information to do a one-time
      human-in-the-loop authentication action, and subsquent, fully autonomous extractions.`,
    },
  },
  [ExampleSite.LEAD_GENERATION]: {
    dirName: "lead-generation",
    metadata: {
      title: "Lead Generation",
      description: `This example showcases how to use Airtop's AI APIs to gather information about a page containing a list of therapists, and then generate lead information with outreach messages tailored to each therapist. This example is orchestrated with Langchain's Langgraph tools. This example is limited to downloading data for 5 therapists only, but check out the source and modify to handle as many leads as you want. While this agent deals with therapists as the target, you can modify the agent to target any kind of lead. Perfect for sales & recruiting.`,
    },
  },
  [ExampleSite.YC_BATCH_COMPANY_EMPLOYEES]: {
    dirName: "yc-batch-company-employees",
    metadata: {
      title: "YC Batch Company's Employees's Profiles",
      description: "Extracts employees from YC batch companies",
    },
  },
  [ExampleSite.CUSTOMER_REVIEWS]: {
    dirName: "customer-reviews",
    metadata: {
      title: "Restaurant reviews",
      description: "Reply to customer reviews",
    },
  },
  [ExampleSite.SIMPLE_INTERACTIONS]: {
    dirName: "simple-interactions",
    metadata: {
      title: "Simple Browser Interactions",
      description: `This example showcases how to use Airtop's AI APIs to interact with a browser. This simple example navigates to [Google Finance](https://www.google.com/finance/), 
      searches for given ticker, symbol selects a 6M timeframe, and extracts the percentage change. This can be easily accomplished with a few lines of code.
      Check out the [repo](https://github.com/airtop-ai/examples-typescript/tree/main/examples/simple-interactions) for the full code.`,
    },
  },
  [ExampleSite.SOCIAL_MEDIA_LISTENING]: {
    dirName: "social-media-listening",
    metadata: {
      title: "Airtop: Social Media Listening",
      description: "Monitor and comment in posts of your interest.",
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
