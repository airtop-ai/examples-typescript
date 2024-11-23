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
};

export const registerToHome = (dirName: string) => {
  return {
    assetPrefix: `/${dirName}-static`,
  };
};

export const getAppUrl = (dirName: string) => {
  return `https://examples.airtop.dev/${dirName}`;
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

export const getHeadersConfig = () => {
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
      ];
    },
  };
};
