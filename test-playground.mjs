#!/usr/bin/env node

/*
  Local GraphQL Playground for static schema (SDL) development/testing.
  - Runs a standalone server on http://localhost:4000/graphql
  - Uses only the static SDL (schema-static.mjs) and stub scalars
  - Does not use dynamic data or production API logic
  - Useful for viewing schema docs and testing queries against the static schema
  - Not used in production or deployment
*/

import http from 'http'
import { createYoga } from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema'
import staticSDL from './schema-static.mjs'

// Stubs for custom scalars referenced in staticSDL
const stubSDL = `
  scalar LanguageCode
  scalar ItemType
  scalar ItemCategoryName
  scalar HandbookCategoryName
`

// Build schema from static SDL and stubs
const schema = makeExecutableSchema({
    typeDefs: [staticSDL, stubSDL],
    resolvers: {},
})

// Enable GraphiQL at /graphql for local exploration
const yoga = createYoga({
    schema,
    graphiql: true,
})

// Start HTTP server on port 4000
const server = http.createServer(yoga)
const PORT = 4000
server.listen(PORT, () => {
    console.log(
        `🚀 GraphQL Playground running at http://localhost:${PORT}/graphql`
    )
})
