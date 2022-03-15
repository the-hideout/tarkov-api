# GraphQL Examples 📚

A document full of helpful examples for how you can use the GraphQL API.

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
