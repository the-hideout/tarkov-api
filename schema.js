module.exports = `
  type GameProperty {
      key: String!
      numericValue: Float
      stringValue: String
      arrayValue: [String]
      objectValue: String
  }

  type Item {
    id: ID!
    name: String
    shortName: String
    basePrice: Int!
    updated: String!
    slots: Int!
    width: Int!
    height: Int!
    iconLink: String
    wikiLink: String
    imageLink: String
    types: [String]!
    avg24hPrice: Int
  }

  type TaskItem {
      item: Item!
      count: Int!
  }

  type Barter {
      source: String!
      requiredItems: [TaskItem]!
      rewardItems: [TaskItem]!
  }

  type Query {
    item(id: ID!): Item
    barters: [Barter]
  }
`;
