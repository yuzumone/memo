# memo
## Setup

```sh
git submodule update --init --recursive
pnpm install
```

## Build and preview

```sh
hugo
hugo server
```

## Deploy

Build the site, then deploy to Cloudflare Workers:

```sh
hugo --gc --minify --cleanDestinationDir
pnpm exec wrangler deploy
```
