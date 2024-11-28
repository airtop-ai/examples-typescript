# Airtop Simple Browser Interactions

This is an example [Airtop](https://www.airtop.ai/) web application built with [`Next.js`](https://nextjs.org/)
app routing and a CLI tool that demonstrates how to interact with a webpage using the Airtop SDK.

- Given an Airtop API key, the code navigates to Google Finance and searches for a ticket provided by the user
- The code then clicks on a chart for the 6M performance of the provided stock ticket
- Finally, the code runs a page query against the data to retrieve an analysis of the stock's performance
- The user will be able to monitor Airtop's actions via a live view of the browser
  * In the CLI, a URL to an Airtop [LiveView](https://docs.airtop.ai/guides/how-to/creating-a-live-view) will be printed
    for the user to paste into their browser
  * In the web application, it will render an iframe with the LiveView URL

## Code

The Airtop code used by the web application and CLI is located in `src/lib/interactions.service.ts` as a class
called `InteractionsService`.

- This is implemented in the web application in the Next.js app router API routes in `src/app/api`.
- The CLI implementation is found in `src/cli/simple-interactions.cli.ts`.
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
