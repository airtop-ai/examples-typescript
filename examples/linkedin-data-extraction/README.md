# Airtop LinkedIn Data Extraction

This is an example [Airtop](https://www.airtop.ai/) web application built with [`Next.js`](https://nextjs.org/)
app routing and a CLI tool that demonstrates how to extract data from LinkedIn using the Airtop SDK.

- Given an Airtop API key, the code checks if the user is currently signed-in to LinkedIn
  * This is true if you supplied an Airtop [`Profile ID`](https://docs.airtop.ai/guides/how-to/saving-a-profile) that 
    had previously signed-in to LinkedIn
- If the user is not signed-in, the user will be prompted to sign in to LinkedIn
  * In the CLI, a URL to an Airtop [LiveView](https://docs.airtop.ai/guides/how-to/creating-a-live-view) will be printed
    for the user to paste into their browser to perform sign-in
  * In the web application, it will render an iframe with the LiveView URL for the user to sign-in
- Once the user is signed-in, the code will extract the user's LinkedIn profile data and print it

## Code

The Airtop code used by the web application and CLI is located in `src/lib/linkedin-extractor.service.ts` as a class
called `LinkedInExtractorService`.

- This is implemented in the web application in the Next.js app router API routes in `src/app/api`.
- The CLI implementation is found in `src/cli/linkedin-extractor.cli.ts`.
- The prompts and values used for the demo is located in `src/consts.ts`

## Installation

See the README in the root of the repository for initial installation instructions.

## Usage

An API key is required to use this example. You can get one [here](https://portal.airtop.ai/api-keys) (sign-up required).

### Web Application

In this directory, to start the web application server, run:

```bash
pnpm dev
```

In most cases, you should be able to access the web application at [http://localhost:3000](http://localhost:3000).

### CLI Tool

To run the CLI version of this example, run:

```bash
pnpm run cli
```
