# Financial Analysis Agent

This is an sample tool that demonstrates automated financial data extraction and analysis using the [Airtop SDK](https://www.airtop.ai/), OpenAI's GPT-4o, and Vercel AI tool use.

## Features

- Connects to a financial data sources using Airtop's browser automation
- Extracts real-time stock price data and historical performance metrics
- Uses AI to analyze and interpret financial data
- Provides a browser-based [LiveView](https://docs.airtop.ai/guides/how-to/creating-a-live-view) URL to monitor the automation in real-time
- Demonstrates how to use Airtop as a tool inside an agentic framework (Vercel AI) to allow the agent to decide how to navigate the web and what to do next

## Getting Started

1. Follow the installation instructions in the root README
2. Get an API key from the [Airtop Portal](https://portal.airtop.ai/api-keys) (requires sign-up)
3. Set up your OpenAI API key and Airtop API Key in the environment variables
   ```bash
   cp .env.example .env
   ```
   Replace the variables with your API keys
4. Run the CLI:
   ```bash
   pnpm run cli
   ```

## Environment Variables

The following environment variables are required:
- `AIRTOP_API_KEY` - Your Airtop API key
- `OPENAI_API_KEY` - Your OpenAI API key
