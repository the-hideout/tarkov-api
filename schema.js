module.exports = `
  enum ItemType {
    any
    ammo
    armor
    backpack
    barter
    glasses
    grenade
    gun
    helmet
    keys
    markedOnly
    mods
    noFlea
    provisions
    unLootable
    wearable
    rig
    headphones
    suppressor
  }

  enum TraderName {
    prapor
    therapist
    fence
    skier
    peacekeeper
    mechanic
    ragman
    jaeger
  }

  enum ItemSourceName {
    prapor
    therapist
    fence
    skier
    peacekeeper
    mechanic
    ragman
    jaeger
    fleaMarket
  }

  enum RequirementType {
      playerLevel
      loyaltyLevel
      questCompleted
  }

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
    normalizedName: String
    shortName: String
    basePrice: Int!
    updated: String
    width: Int!
    height: Int!
    iconLink: String
    wikiLink: String
    imageLink: String
    gridImageLink: String
    types: [ItemType]!
    avg24hPrice: Int
    accuracyModifier: Float
    recoilModifier: Float
    ergonomicsModifier: Float
    hasGrid: Boolean
    blocksHeadphones: Boolean
    traderPrices: [TraderPrice]!
    link: String
    lastLowPrice: Int
    changeLast48h: Float
    low24hPrice: Int
    high24hPrice: Int
    sellFor: [ItemPrice!]
    buyFor: [ItemPrice!]
  }

  type ItemPrice {
      source: ItemSourceName
      price: Int
      currency: String
      requirements: [PriceRequirement]!
  }

  type PriceRequirement {
      type: RequirementType
      value: Int
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

  type TraderInventory {
    id: String!
    name: TraderName!
    items: [TraderInventoryItem!]
  }

  type TraderInventoryItem {
    item: Item!
    minLevel: Int
    price: Int
    updated: String
    questUnlockId: String
    currency: String
  }

  type QuestRequirement {
      level: Int
      quests: [[Int]]!
      prerequisiteQuests: [[Quest]]!
  }

  type QuestRewardReputation {
      trader: Trader!
      amount: Float!
  }

  type QuestObjective {
      id: String
      type: String!
      target: [String!]
      targetItem: Item
      number: Int
      location: String
  }

  type Quest {
    id: String!
    requirements: QuestRequirement
    giver: Trader!
    turnin: Trader!
    title: String!
    wikiLink: String!
    exp: Int!
    unlocks: [String]!
    reputation: [QuestRewardReputation!]
    objectives: [QuestObjective]!
  }

  type TraderPrice {
      price: Int!
      trader: Trader!
  }

  type HideoutModuleItemRequirement {
      item: Item!
      quantity: Int!
  }

  type HideoutModule {
      name: String
      level: Int
      itemRequirements: [HideoutModuleItemRequirement]!
      moduleRequirements: [HideoutModule]!
  }

  type Query {
    item(id: ID!): Item
    itemsByType(type: ItemType!): [Item]!
    itemsByName(name: String!): [Item]!
    barters: [Barter]
    crafts: [Craft]
    quests: [Quest]
    hideoutModules: [HideoutModule]
    # traderInventoryByName(name: TraderName!): TraderInventory
  }
`;
