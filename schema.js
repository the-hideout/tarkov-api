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
    accuracyModifier: Int
    recoilModifier: Int
    ergonomicsModifier: Int
  }

  type TaskItem {
    item: Item!
    count: Float!
  }

  type QuestItem {
    item: Item!
    count: Float!
    foundInRaid: Boolean!
  }

  type Barter {
    source: String!
    requiredItems: [TaskItem]!
    rewardItems: [TaskItem]!
  }

  type Craft {
    source: String!
    duration: Int!
    requiredItems: [TaskItem]!
    rewardItems: [TaskItem]!
  }

  type Trader {
    id: String!
    name: String!
  }

  type Quest {
    id: String!
    trader: Trader!
    items: [QuestItem]
  }

  type Query {
    item(id: ID!): Item
    barters: [Barter]
    crafts: [Craft]
    quests: [Quest]
  }
`;
