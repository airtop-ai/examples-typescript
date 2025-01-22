# CLI Example

*This is a template for creating a new CLI-only example.*

This is an example CLI tool that demonstrates LinkedIn data extraction using the [Airtop SDK](https://www.airtop.ai/).

## Features

- Checks LinkedIn sign-in status using your Airtop API key and [`Profile Name`](https://docs.airtop.ai/guides/how-to/saving-a-profile)
- Handles user authentication:
  * If not signed in, provides an Airtop [LiveView](https://docs.airtop.ai/guides/how-to/creating-a-live-view) URL for browser-based sign-in
  * Once authenticated, extracts and displays LinkedIn profile data

## Project Structure

- `src/linkedin-extractor.service.ts` - Core Airtop integration (`LinkedInExtractorService` class)
- `src/linkedin-extractor.cli.ts` - CLI implementation
- `src/consts.ts` - Demo configuration and prompts

## Getting Started

1. Follow the installation instructions in the root README
2. Get an API key from the [Airtop Portal](https://portal.airtop.ai/api-keys) (requires sign-up)
3. Run the CLI:
   ```bash
   pnpm run cli
   ```
