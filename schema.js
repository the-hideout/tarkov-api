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
    updated: String
    width: Int!
    height: Int!
    iconLink: String
    wikiLink: String
    imageLink: String
    types: [String]!
    avg24hPrice: Int
    accuracyModifier: Float
    recoilModifier: Float
    ergonomicsModifier: Float
  }

  type TaskItem {
    item: Item!
    count: Float!
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

  type QuestRequirement {
      level: Int,
      quests: [String]!
  }

  type QuestRewardReputation {
      trader: Trader!
      amount: Float!
  }

  type QuestObjective {
      id: String
      type: String!
      target: String!
      targetItem: Item
      number: Int
      location: String
  }

  type Quest {
    id: String!
    requirements: [QuestRequirement]!
    giver: Trader!
    turnin: Trader!
    title: String!
    wikiLink: String!
    exp: Int!
    unlocks: [String]!
    reputation: [QuestRewardReputation!]
    objectives: [QuestObjective]!
  }

  type Query {
    item(id: ID!): Item
    barters: [Barter]
    crafts: [Craft]
    quests: [Quest]
  }
`;
