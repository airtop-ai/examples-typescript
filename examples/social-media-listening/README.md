# Airtop Social Media Listening

This is an example [Airtop](https://www.airtop.ai/) web application built with [`Next.js`](https://nextjs.org/)
app routing and a CLI tool that demonstrates how to automate replying to posts on social media platforms (X for this demo).

## Overview

The application will require you to enter a few parameters before searching posts:

 - **Airtop Profile Id** (Optional): If there's a [Profile](https://docs.airtop.ai/guides/how-to/saving-a-profile) that you want to use for the session, you can provide it here.
 - **Query**: The query to use in X's search bar. E.g. _#ai #agents #langchain_.
 - **Match Prompt**: The criteria to use to find candidate posts to reply to. E.g. _The post mentions an AI framework or tool_.
 - **Reply Prompt**: The way in which the reply should be written. E.g. _Friendly response that casually mentions Airtop_.
 - **Result Limit**: The number of posts to extract.

Once the app is configured, the agent will go to x.com, ask to sign in if necessary and search for posts that match the criteria. Then, it will generate a reply to the first matched post and reply (upon confirmation).


## Code

The core functionality of this application is implemented in the `src/lib/x-interaction.service.ts` file as a class
called `XInteractionService`. Both the web application and CLI script use this class to interact with X.

**Other key files:**
- The prompts and values used for the demo are located in `src/consts.ts`
- `src/app/api` contains the API routes for the Next.js application.
- The CLI implementation is found in `src/cli/social-media-listening.cli.ts`.


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

**Configuration**

The CLI requires certain environment variables to function correctly. You can set these variables in the `.env` file that was created after installing the project's dependencies. You can find the `.env` file in the root of the project (at the same level as this README file).

*Variables in the `.env` file:*

```
AIRTOP_API_KEY=your_airtop_api_key
AIRTOP_PROFILE_ID=your_optional_profile_id
```

Alternatively, if environment variables are not set, the CLI will prompt you to enter the required information interactively.

To run the CLI version of this example, run:

```bash
pnpm run cli
```

If you want to run the example with the default inputs, you can run:

```bash
pnpm run cli --defaults
```
