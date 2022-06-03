# The Hideout API 💻

[![deploy](https://github.com/the-hideout/tarkov-data-api/actions/workflows/deploy.yml/badge.svg)](https://github.com/the-hideout/tarkov-data-api/actions/workflows/deploy.yml) [![Discord](https://img.shields.io/discord/956236955815907388?color=7388DA&label=Discord)](https://discord.gg/XPAsKGHSzH)

This is the main API for [tarkov.dev](https://tarkov.dev), and was forked from kokarn's Tarkov Tools API.

It's a simple [GraphQL](https://graphql.org/) API running on [Cloudflare workers](https://workers.cloudflare.com/).

This API powers all of tarkov.dev and other notable projects as well:

- [ratscanner](https://github.com/RatScanner/RatScanner)
- [errbot](https://github.com/GrantBirki/errbot)
- [thehideout](https://play.google.com/store/apps/details?id=com.austinhodak.thehideout&hl=en_US&gl=US)

## API Playground 🎾

There is a GraphQL playground for you to use and test out

**Link:** [api.tarkov.dev/___graphql](https://api.tarkov.dev/___graphql)

Example Query:

```graphql
query {
  itemsByType(type: any) {
      id
      name
      shortName
      wikiLink
      iconLink
      updated
  }
}
```

> More examples can be found in our [graphql example docs](./docs/graphql-examples.md) 📚

## Development 🔨

Prerequisites:

- Install [Wrangler](https://github.com/cloudflare/wrangler)
- Run `wrangler login` - (needed for k/v store and secrets)

Start the API server:

- Start the dev environment by running `npm run dev`
- Then open up the playground on [localhost:8787/___graphql](http://127.0.0.1:8787/___graphql)

## Deployment 🚀

If you wish to deploy locally and have permissions to do so, run the following command:

```bash
wrangler publish
```
