# Contributing

Currently we are only accepting contributions from Airtop employees and contractors.

## Creating a new example

### If your example is suitable for hosting

Your example is suitable for hosting if the following applies:

- It is a standalone example that demonstrates a specific feature or use case of Airtop
- The example does not require a runtime of over 300 seconds to complete
- The example can be presented through a web interface
- Does not require complex dependencies (eg a database)

#### Steps to create a new hosted example

- Copy one of the existing examples in the `examples/` directory to another directory
  * *Do not copy the `_home` directory as this is not an example.*
  * Run `pnpm install` to install the dependencies
- Update the `README.md` in the new directory to describe the example
- Edit `packages/home-config/src/index.ts` and add the details of your example
  * Run `turbo build:packages` to rebuild the package
- Update the `next.config.js` file to include the new directory in the `registerToHome` function
- The main entrypoint to the application is `src/app/page.tsx`
- Define API routes in the `src/app/api` directory
- Define CLI examples in the `src/cli` directory
- Edit the `package.json` to update the name and description of the example
  * Update the `cli` script entry to point to the CLI file

### If your example is not suitable for hosting

Your example is not suitable for hosting if the following applies:

- Long running examples that may take more than 300 seconds to complete
- Cannot be easily presented through a web interface
- Requires complex dependencies like a database

#### Steps to create a new non-hosted example

- Copy the `cli-only-template` directory and give it a name that describes the example
  * Run `pnpm install` to install the dependencies
- Edit the `README.md` describe the example
- Edit the files in the `src` directory to implement the example
  * Feel free to add / remove files as needed
- Edit the `package.json` to update the name and description of the example
  * Update the `cli` script entry to point to the CLI file

## Deploying a hosted example

This only needs to be performed once for new examples.

- Sign in to [Vercel](https://vercel.com/) and select the proper organization
- Click `Add New...` > `Project`
- In `Import Git Repository`, select the `examples-typescript` repository
- Edit the `Root Directory` to point to the example directory
- Then click `Deploy`

### Assigning environment variables

- Go to the *organization level settings* > `Environment Variables`
- For each environment variable listed, in `Link to Projects`, select the project you just deployed > `Save`
- Re-deploy the project by going to the project > `Deployments` > `Redeploy` on the current deployment

### Assigning the domain name

- Go to the project > `Settings` > `Domains` > `<your dir name>.examples.airtop.dev` > `Add`
  * Make sure it is `.examples.airtop.dev` (the `.dev` part is important here)
- Then your project should be accessible via `https://examples.airtop.ai/<your dir name>`.
  * This is `examples.airtop.ai` (the `.ai` part is imporatnt here)

## Before a commit

- `package.json` dependencies should be pinned to the exact version. 
- Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    * The commit message should be in the format `<type>(<scope>): <description>`. The `scope` is optional. The description must be lowercased.
- This project uses [changeset](https://github.com/changesets/changesets) for managing releases. Use the `changeset:add` 
command to add a changeset for your changes.
    * Fixes should be added to the `patch` category.
    * New features should be added to the `minor` category.
    * Breaking changes should be added to the `major` category.
