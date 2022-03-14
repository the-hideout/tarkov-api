# The Hideout API 💻

This is the main API for [thehideout.io](https://thehideout.io/).

It's a simple graphql API running on Cloudflare workers.

## API Playground 🎾

There is a graphql playground for you to use and expirement with, to get familiar with the API

**URL:** [api.thehideout.io/___graphql](https://api.thehideout.io/___graphql) 🔗

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

## Development 🔨

* Start the dev environment by running `npm run dev`
* Then open up the playground on [localhost:8787/___graphql](http://127.0.0.1:8787/___graphql)

## Deployment 🚀

```bash
wrangler publish
```
