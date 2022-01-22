module.exports = `
  enum ItemType {
    ammo
    ammoBox
    any
    armor
    backpack
    barter
    container
    disabled
    glasses
    grenade
    gun
    headphones
    helmet
    injectors
    keys
    markedOnly
    meds
    mods
    noFlea
    pistolGrip
    preset
    provisions
    rig
    suppressor
    unLootable
    wearable
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

  enum StatusCode {
      OK
      Updating
      Unstable
      Down
  }

  enum LanguageCode {
      en
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
    iconLinkFallback: String!
    wikiLink: String
    imageLink: String
    imageLinkFallback: String!
    gridImageLink: String
    gridImageLinkFallback: String!
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
    changeLast48hPercent: Float
    low24hPrice: Int
    high24hPrice: Int
    sellFor: [ItemPrice!]
    buyFor: [ItemPrice!]
    containsItems: [ContainedItem]
    translation(languageCode: LanguageCode): ItemTranslation
  }

  type ItemPrice {
      source: ItemSourceName
      price: Int
      currency: String
      requirements: [PriceRequirement]!
  }

  type ItemTranslation {
      name: String
      shortName: String
      description: String
  }

  type historicalPricePoint {
    price: Int
    timestamp: String
  }

  type PriceRequirement {
      type: RequirementType
      value: Int
  }

  type ContainedItem {
    item: Item!
    count: Float!
    quantity: Int!
  }

  type Barter {
    source: String!
    requiredItems: [ContainedItem]!
    rewardItems: [ContainedItem]!
  }

  type Craft {
    source: String!
    duration: Int!
    requiredItems: [ContainedItem]!
    rewardItems: [ContainedItem]!
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

  type HideoutModule {
      id: Int
      name: String
      level: Int
      itemRequirements: [ContainedItem]!
      moduleRequirements: [HideoutModule]!
  }

  type Status {
      name: String!
      message: String
      status: Int!
      statusCode: String!
  }

  type StatusMessage {
    content: String!
    time: String!
    type: Int!
    solveTime: String
    statusCode: String!
}

  type ServerStatus {
      generalStatus: Status
      currentStatuses: [Status]
      messages: [StatusMessage]
  }

  type TraderResetTime {
      name: String
      resetTimestamp: String
  }

  type Query {
    item(id: ID!): Item
    itemsByType(type: ItemType!): [Item]!
    itemsByName(name: String!): [Item]!
    historicalItemPrices(id: ID!): [historicalPricePoint]!
    barters: [Barter]
    crafts: [Craft]
    quests: [Quest]
    hideoutModules: [HideoutModule]
    status: ServerStatus!
    # traderInventoryByName(name: TraderName!): TraderInventory
    traderResetTimes: [TraderResetTime]
  }
`;
