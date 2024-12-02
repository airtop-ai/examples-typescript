# Airtop Examples

This repository contains a collection of examples that demonstrate how to use [Airtop](https://docs.airtop.ai/guides/getting-started/what-is-airtop)
in various applications.

## Pre-requisites

- Node.js 20 or higher is required to run these examples.
- [pnpm](https://pnpm.io/) is used as the package manager. 
  * [Install pnpm](https://pnpm.io/installation)
- [turbo](https://turbo.build/) is used to build the shared packages.
  * [Install turbo](https://turbo.build/repo/docs/getting-started/installation#global-installation) 

## Installation

- Clone this repository
- Install all dependencies by running:
  ```bash
  pnpm install
  ```
- Build the packages by running:
  ```bash
  turbo build:packages
  ```

You should now be able to try out the examples in this repository which are located in `examples/`.

See the `README.md` in each example project for more information on how to run the example.

## Development

It's recommended to have two terminals opened:

- One that runs `turbo watch build:packages` so that the shared packages are built automatically on changes.
- Another that runs the example you are working on using `pnpm dev`

## Environment variables

`packages/home-config/.common-env` is copied over as `.env` in each example. The following environment variables are used:

- `SECRET_FOR_DECRYPTING_API_KEYS`: base64-encoded 32-byte random string.
  Meant to be used with the Airtop Portal to pass encrypted API keys for use with the Get API Key feature. Disabled for local development.
- `EXAMPLES_SITES_COOKIE_SECRET`: 32-character random string for securing the session cookie. The default value is meant for local development only.
- `AIRTOP_PORTAL_URL`: URL to the Airtop Portal
- `NEXT_PUBLIC_AIRTOP_PORTAL_URL`: URL to the Airtop Portal (for client-side)

## Tools used

Most examples use the following:

- [Airtop SDK](https://docs.airtop.ai/api-reference/airtop-api)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [zustand](https://github.com/pmndrs/zustand) for client-side state management in React
- [zod](https://zod.dev/) for input validation
- [React Hook Form](https://react-hook-form.com/) for forms
- [Loglayer](https://github.com/theogravity/loglayer) for logging (backed using `console.log`)
- [Inquirer.js](https://www.npmjs.com/package/inquirer) for CLI prompts
- [Biome](https://biomejs.dev/) for linting and formatting
