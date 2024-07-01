# DID Explorer

### Deploy

Next, in the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/pages), create a new Pages project:

- Navigate to the project creation pages (_Your account Home_ > _Workers & Pages_ > _Create application_ > _Pages_ > _Connect to Git_).
- Select the GitHub/GitLab repository you pushed your code to.
- Choose a project name and your production branch.
- Select _Next.js_ as the _Framework preset_ and provide the following options:
  | Option | Value |
  | ---------------------- | ---------------------------------- |
  | Build command | `pnpm dlx @cloudflare/next-on-pages@1` |
  | Build output directory | `.vercel/output/static` |
- In the _Environment variables (advanced)_ section, add a new variable named `NODE_VERSION` set to `20` or greater, add a new variable named `NEXT_PUBLIC_GRAPHQL_URI` set to `https://indexer-dev-api.dephy.id/branch/main/graphql/explore`.
- Click on _Save and Deploy_ to start the deployment (this first deployment won't be fully functional as the next step is also necessary).
- Go to the Pages project settings page (_Settings_ > _Functions_ > _Compatibility Flags_), **add the `nodejs_compat` flag** for both production and preview, and make sure that the **Compatibility Date** for both production and preview is set to at least `2022-11-30`.
