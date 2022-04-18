module.exports = `
type Ammo {
  item: Item!
  weight: Float!
  caliber: String!
  stackMaxSize: Int!
  tracer: Boolean!
  tracerColor: String
  ammoType: String!
  projectileCount: Int
  damage: Int!
  armorDamage: Int!
  fragmentationChance: Float!
  ricochetChance: Float!
  penetrationChance: Float!
  penetrationPower: Int!
  accuracy: Int!
  recoil: Int!
  initialSpeed: Int!
  lightBleedModifier: Float!
  heavyBleedModifier: Float!
}

type Barter {
  trader: Trader!
  source: String! @deprecated(reason: "Use trader and requirements instead.")
  sourceName: ItemSourceName! @deprecated(reason: "Use trader instead.")
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  requirements: [PriceRequirement]!
}

type ContainedItem {
  item: Item!
  count: Float!
  quantity: Float!
  attributes: [ItemAttribute]
}

type Craft {
  id: ID!
  source: String! @deprecated(reason: "Use stationLevel instead.")
  sourceName: String! @deprecated(reason: "Use stationLevel instead.")
  stationLevel: HideoutStationLevel!
  duration: Int!
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  requirements: [PriceRequirement]! @deprecated(reason: "Use stationLevel instead.")
}

type GameProperty {
  key: String!
  numericValue: Float
  stringValue: String
  arrayValue: [String]
  objectValue: String
}

"""
HideoutModule is deprecated and replaced with HideoutStationLevel.
"""
type HideoutModule {
  id: Int
  name: String
  level: Int
  itemRequirements: [ContainedItem]!
  moduleRequirements: [HideoutModule]!
}

type HideoutStation {
  id: ID!
  name: String!
  modules: [HideoutStationLevel]!
}

type HideoutStationLevel {
  id: ID!
  name: String!
  level: Int!
  constructionTime: Int!
  description: String!
  itemRequirements: [RequirementItem]!
  moduleRequirements: [RequirementHideoutStationLevel]!
  skillRequirements: [RequirementSkill]!
  traderRequirements: [RequirementTrader]!
}

type historicalPricePoint {
  price: Int
  timestamp: String
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
  bsgCategoryId: String
  weight: Float
  velocity: Float
  loudness: Int
  translation(languageCode: LanguageCode): ItemTranslation
}

type ItemAttribute {
  type: String!
  value: String
}

type ItemPrice {
  source: ItemSourceName
  price: Int
  currency: String
  requirements: [PriceRequirement]!
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

type ItemTranslation {
  name: String
  shortName: String
  description: String
}

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

enum LanguageCode {
  en
}

type PriceRequirement {
  type: RequirementType!
  value: Int
  stringValue: String
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

type QuestObjective {
  id: String
  type: String!
  target: [String!]
  targetItem: Item
  number: Int
  location: String
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

type RequirementHideoutStationLevel {
  id: ID
  module: HideoutStationLevel!
}

type RequirementItem {
  id: ID
  item: Item!
  count: Int!
  quantity: Int!
  attributes: [ItemAttribute]
}

type RequirementSkill {
  id: ID
  name: String!
  level: Int!
}

type RequirementTrader {
  id: ID
  trader: Trader!
  level: Int!
}

enum RequirementType {
  playerLevel
  loyaltyLevel
  questCompleted
  stationLevel
}

type ServerStatus {
  generalStatus: Status
  currentStatuses: [Status]
  messages: [StatusMessage]
}

type SkillLevel {
  name: String!
  level: Int!
}

type Status {
  name: String!
  message: String
  status: Int!
  statusCode: String!
}

enum StatusCode {
  OK
  Updating
  Unstable
  Down
}

type StatusMessage {
  content: String!
  time: String!
  type: Int!
  solveTime: String
  statusCode: String!
}

type Trader {
  id: ID!
  name: String!
}

type TraderInventory {
  id: ID!
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

type TraderPrice {
  price: Int!
  trader: Trader!
}

type TraderResetTime {
  name: String
  resetTimestamp: String
}

type Query {
  item(id: ID!): Item
  itemsByIDs(ids: [ID]!): [Item]
  itemsByType(type: ItemType!): [Item]!
  itemsByName(name: String!): [Item]!
  itemByNormalizedName(normalizedName: String!): Item
  itemsByBsgCategoryId(bsgCategoryId: String!): [Item]!
  historicalItemPrices(id: ID!): [historicalPricePoint]!
  barters: [Barter]
  crafts: [Craft]
  quests: [Quest]
  hideoutModules: [HideoutModule] @deprecated(reason: "No longer maintained. Use hideoutStations instead.")
  hideoutStations: [HideoutStation]!
  status: ServerStatus!
  # traderInventoryByName(name: TraderName!): TraderInventory
  traderResetTimes: [TraderResetTime]
  ammo: [Ammo]
}
`;
