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
  #attributes: AttributeCollection!
}

#type AttributeCollection {
#  int: [AttributeInt]!
#  float: [AttributeFloat]!
#  string: [ItemAttribute]!
#  boolean: [AttributeBoolean]!
#}

#type AttributeBoolean {
#  name: String!
#  value: Boolean!
#}

#type AttributeFloat {
#  name: String!
#  value: Float!
#}

#type AttributeInt {
#  name: String!
#  value: Int!
#}

type AttributeThreshold {
  name: String!
  requirement: NumberCompare!
}

type Barter {
  trader: Trader!
  level: Int!
  taskUnlock: Task
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  source: String! @deprecated(reason: "Use trader and level instead.")
  sourceName: ItemSourceName! @deprecated(reason: "Use trader instead.")
  requirements: [PriceRequirement]! @deprecated(reason: "Use level instead.")
}

type ContainedItem {
  item: Item!
  count: Float!
  quantity: Float!
  attributes: [ItemAttribute]
}

type Craft {
  id: ID!
  station: HideoutStation!
  level: Int!
  duration: Int!
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  source: String! @deprecated(reason: "Use stationLevel instead.")
  sourceName: String! @deprecated(reason: "Use stationLevel instead.")
  requirements: [PriceRequirement]! @deprecated(reason: "Use stationLevel instead.")
}

type GameProperty {
  key: String!
  numericValue: Float
  stringValue: String
  arrayValue: [String]
  objectValue: String
}

type FleaMarket implements Vendor {
  name: String!
  minPlayerLevel: Int!
}

type HealthEffect {
  bodyParts: [String]!
  effects: [String]!
  time: NumberCompare
}

type HideoutStation {
  id: ID!
  name: String!
  levels: [HideoutStationLevel]!
  "crafts is only available via the hideoutStations query."
  crafts: [Craft]!
}

type HideoutStationLevel {
  id: ID!
  #name: String!
  level: Int!
  constructionTime: Int!
  description: String!
  itemRequirements: [RequirementItem]!
  stationLevelRequirements: [RequirementHideoutStationLevel]!
  skillRequirements: [RequirementSkill]!
  traderRequirements: [RequirementTrader]!
  "crafts is only available via the hideoutStations query."
  crafts: [Craft]!
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
  bsgCategory: ItemCategory
  weight: Float
  velocity: Float
  loudness: Int
  translation(languageCode: LanguageCode): ItemTranslation
  usedInTasks: [Task]!
  receivedFromTasks: [Task]!
  bartersFor: [Barter]!
  bartersUsing: [Barter]!
  craftsFor: [Craft]!
  craftsUsing: [Craft]!
  traderPrices: [TraderPrice]! @deprecated(reason: "Use sellFor instead.")
}

type ItemAttribute {
  type: String!
  name: String!
  value: String
}

type ItemCategory {
  id: ID!
  name: String!
  parent: ItemCategory
}

type ItemGroup {
  items: [Item]!
}

type ItemPrice {
  vendor: Vendor!
  price: Int
  currency: String
  currencyItem: Item
  priceRUB: Int
  source: ItemSourceName @deprecated(reason: "Use vendor instead.")
  requirements: [PriceRequirement]! @deprecated(reason: "Use vendor instead.")
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

type Map {
  id: ID!
  tarkovDataId: ID
  name: String
  wiki: String
  description: String
  enemies: [String]
  raidDuration: Int
  #svg: MapSvg
}

#type MapSvg {
#  file: String
#  floors: [String]
#  defaultFloor: String
#}

type NumberCompare {
  compareMethod: String!
  value: Float!
}

type OfferUnlock {
  id: ID!
  trader: Trader!
  level: Int!
  item: Item!
}

type PriceRequirement {
  type: RequirementType!
  value: Int
  stringValue: String
}

type QuestItem {
  id: ID
  name: String!
}

type RequirementHideoutStationLevel {
  id: ID
  station: HideoutStation!
  level: Int!
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

type RequirementTask {
  id: ID
  task: Task!
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
  level: Float!
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

type Task {
  id: ID
  tarkovDataId: Int
  name: String!
  trader: Trader!
  #locationName: String!
  map: Map
  experience: Int!
  wikiLink: String
  minPlayerLevel: Int
  taskRequirements: [TaskStatusRequirement]!
  traderLevelRequirements: [RequirementTrader]!
  objectives: [TaskObjective]!
  startRewards: TaskRewards
  finishRewards: TaskRewards
  factionName: String
  neededKeys: [TaskKey]
}

type TaskKey {
  keys: [Item]!
  map: Map
}

interface TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
}

type TaskObjectiveBasic implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
}

type TaskObjectiveBuildItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  item: Item!
  containsAll: [Item]!
  containsOne: [Item]!
  attributes: [AttributeThreshold]!
}

type TaskObjectiveExperience implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  healthEffect: HealthEffect!
}

type TaskObjectiveExtract implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  exitStatus: [String]!
  zoneNames: [String]!
}

type TaskObjectiveItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  item: Item!
  count: Int!
  foundInRaid: Boolean!
  dogTagLevel: Int
  maxDurability: Int
  minDurability: Int
}

type TaskObjectiveMark implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  markerItem: Item!
}

type TaskObjectivePlayerLevel implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  playerLevel: Int!
}

type TaskObjectiveQuestItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  questItem: QuestItem!
  count: Int!
}

type TaskObjectiveShoot implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  target: String!
  count: Int!
  shotType: String!
  zoneNames: [String]!
  bodyParts: [String]!
  usingWeapon: [Item]
  usingWeaponMods: [ItemGroup]
  wearing: [ItemGroup]
  notWearing: [Item]
  distance: NumberCompare
  playerHealthEffect: HealthEffect
  enemyHealthEffect: HealthEffect
}

type TaskObjectiveSkill implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  skillLevel: SkillLevel!
}

type TaskObjectiveTaskStatus implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  task: Task!
  status: [String]!
}

type TaskObjectiveTraderLevel implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  trader: Trader!
  level: Int!
}

type TaskRewards {
  traderStanding: [TraderStanding]!
  items: [ContainedItem]!
  offerUnlock: [OfferUnlock]!
  skillLevelReward: [SkillLevel]!
  traderUnlock: [Trader]!
}

type TaskStatusRequirement {
  task: Task!
  status: [String]!
}

type Trader {
  id: ID!
  name: String!
  resetTime: String
  currency: Item!
  levels: [TraderLevel!]!
  "barters and cashOffers are only available via the traders query."
  barters: [Barter]!
  cashOffers: [TraderCashOffer]!
}

type TraderLevel {
  id: ID!
  #name: String!
  level: Int!
  requiredPlayerLevel: Int!
  requiredReputation: Float!
  requiredCommerce: Int!
  payRate: Float!
  insuranceRate: Float
  repairCostMultiplier: Float
  "barters and cashOffers are only available via the traders query."
  barters: [Barter]!
  cashOffers: [TraderCashOffer]!
}

type TraderCashOffer {
  item: Item!
  minTraderLevel: Int
  price: Int
  currency: String
  currencyItem: Item
  priceRUB: Int
  #updated: String
  taskUnlock: Task
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

type TraderOffer implements Vendor {
  name: String!
  trader: Trader!
  #traderLevel: TraderLevel!
  minTraderLevel: Int
  taskUnlock: Task
}

type TraderStanding {
  trader: Trader!
  standing: Float!
}

interface Vendor {
  name: String!
}
#union Vendor = TraderOffer | FleaMarket

type Query {
  ammo: [Ammo]  
  barters: [Barter]
  crafts: [Craft]
  hideoutStations: [HideoutStation]!
  historicalItemPrices(id: ID!): [historicalPricePoint]!
  item(id: ID, normalizedName: String): Item
  items(ids: [ID], name: String, names: [String], type: ItemType, bsgCategoryId: String, bsgCategory: String): [Item]!
  itemCategories: [ItemCategory]!
  maps: [Map]!
  status: ServerStatus!
  task(id: ID!): Task
  tasks(faction: String): [Task]!
  traders: [Trader]!
  hideoutModules: [HideoutModule] @deprecated(reason: "Use hideoutStations instead.")
  itemsByIDs(ids: [ID]!): [Item] @deprecated(reason: "Use items instead.")
  itemsByType(type: ItemType!): [Item]! @deprecated(reason: "Use items instead.")
  itemsByName(name: String!): [Item]! @deprecated(reason: "Use items instead.")
  itemByNormalizedName(normalizedName: String!): Item @deprecated(reason: "Use item instead.")
  itemsByBsgCategoryId(bsgCategoryId: String!): [Item]! @deprecated(reason: "Use items instead.")
  quests: [Quest] @deprecated(reason: "Use tasks instead.")
  traderResetTimes: [TraderResetTime] @deprecated(reason: "Use traders instead.") 
}

"""
The below types are all deprecated and may not return current data.
HideoutModule has been replaced with HideoutStation.
"""
type HideoutModule {
  id: Int @deprecated(reason: "Use HideoutStation type instead.")
  name: String @deprecated(reason: "Use HideoutStation type instead.")
  level: Int
  itemRequirements: [ContainedItem]!
  moduleRequirements: [HideoutModule]!
}

"""
Quest has been replaced with Task.
"""
type Quest {
  id: String! @deprecated(reason: "Use Task type instead.")
  requirements: QuestRequirement @deprecated(reason: "Use Task type instead.")
  giver: Trader! @deprecated(reason: "Use Task type instead.")
  turnin: Trader! @deprecated(reason: "Use Task type instead.")
  title: String! @deprecated(reason: "Use Task type instead.")
  wikiLink: String! @deprecated(reason: "Use Task type instead.")
  exp: Int! @deprecated(reason: "Use Task type instead.")
  unlocks: [String]! @deprecated(reason: "Use Task type instead.")
  reputation: [QuestRewardReputation!] @deprecated(reason: "Use Task type instead.")
  objectives: [QuestObjective]! @deprecated(reason: "Use Task type instead.")
}

"""
QuestObjective has been replaced with TaskObjective.
"""
type QuestObjective {
  id: String @deprecated(reason: "Use Task type instead.")
  type: String! @deprecated(reason: "Use Task type instead.")
  target: [String!] @deprecated(reason: "Use Task type instead.")
  targetItem: Item @deprecated(reason: "Use Task type instead.")
  number: Int @deprecated(reason: "Use Task type instead.")
  location: String @deprecated(reason: "Use Task type instead.")
}

"""
QuestRequirement has been replaced with TaskRequirement.
"""
type QuestRequirement {
  level: Int @deprecated(reason: "Use Task type instead.")
  quests: [[Int]]! @deprecated(reason: "Use Task type instead.")
  prerequisiteQuests: [[Quest]]! @deprecated(reason: "Use Task type instead.")
}

type QuestRewardReputation {
  trader: Trader! @deprecated(reason: "Use Task type instead.")
  amount: Float! @deprecated(reason: "Use Task type instead.")
}

"""
TraderPrice is deprecated and replaced with ItemPrice.
"""
type TraderPrice {
  price: Int! @deprecated(reason: "Use item.buyFor instead.")
  currency: String! @deprecated(reason: "Use item.buyFor instead.")
  priceRUB: Int! @deprecated(reason: "Use item.buyFor instead.")
  trader: Trader! @deprecated(reason: "Use item.buyFor instead.")
}

"""
TraderResetTime is deprecated and replaced with Trader.
"""
type TraderResetTime {
  name: String @deprecated(reason: "Use Trader.name type instead.")
  resetTimestamp: String @deprecated(reason: "Use Trader.resetTime type instead.")
}
`;
