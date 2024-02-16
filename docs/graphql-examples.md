# GraphQL Examples 📚

A document full of helpful examples for how you can use the GraphQL API.

> Note: For even more examples (and different programming languages) check out our API page: [tarkov.dev/api](https://tarkov.dev/api)

## Examples

### Game Status

Get information about server and game status for Escape from Tarkov

```graphql
{
  status {
    currentStatuses {
      name
      message
      status
    }
    messages {
      time
      type
      content
      solveTime
    }
  }
}
```

### Item Data

Retrieve information about a given item in the game.

```graphql
{
  itemsByName(name: "colt m4a1") {
    name
    types
    avg24hPrice
    basePrice
    width
    height
    changeLast48hPercent
    iconLink
    link
    sellFor {
      price
      source
    }
  }
}
```

### Tasks

Retrieve quest or task info.

[Inline fragments](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces) are used as `objectives` return an `interface TaskObjective`.

```graphql
query {
  tasks {
    id
    name
    objectives {
      id
      type
    	description
      maps {
        normalizedName
      }
      ... on TaskObjectiveItem {
        item {
          name
          shortName
        }
        items {
          name
          shortName
        }
        count
        foundInRaid
      }
      ... on TaskObjectiveShoot{
        targetNames
        count
      }
    }
  }
}
```