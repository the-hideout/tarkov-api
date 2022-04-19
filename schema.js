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
  #traderLevel: TraderLevel!
  #taskUnlock: Task
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  source: String! @deprecated(reason: "Use traderLevel instead.")
  sourceName: ItemSourceName! @deprecated(reason: "Use traderLevel instead.")
  requirements: [PriceRequirement]! @deprecated(reason: "Use traderLevel instead.")
}

type ContainedItem {
  item: Item!
  count: Float!
  quantity: Float!
  attributes: [ItemAttribute]
}

type Craft {
  id: ID!
  #stationLevel: HideoutStationLevel!
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

type HealthEffect {
  bodyParts: [String]!
  effects: [String]!
  time: Int
}

type HideoutStation {
  id: ID!
  name: String!
  #levels: [HideoutStationLevel]!
}

type HideoutStationLevel {
  id: ID!
  name: String!
  level: Int!
  constructionTime: Int!
  description: String!
  #itemRequirements: [RequirementItem]!
  #moduleRequirements: [RequirementHideoutStationLevel]!
  #skillRequirements: [RequirementSkill]!
  #traderRequirements: [RequirementTrader]!
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

type ItemGroup {
  items: [Item]!
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

type NumberCompare {
  compareMethod: String!
  value: Float!
}

type OfferUnlock {
  id: ID!
  #traderLevel: TraderLevel!
  item: Item!
}

type PriceRequirement {
  type: RequirementType!
  value: Int
  stringValue: String
}

type RequirementHideoutStationLevel {
  id: ID
  #module: HideoutStationLevel!
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
  #task: Task!
}

type RequirementTrader {
  id: ID
  #traderLevel: TraderLevel!
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
  id: ID!
  name: String!
  #trader: Trader!
  locationName: String!
  experience: Int!
  wikiLink: String
  minPlayerLevel: Int
  #taskRequirements: [TaskStatusRequirement]!
  #traderLevelRequirements: [TraderLevel]!
  #objectives: [TaskObjective]!
  #startRewards: TaskRewards
  #finishRewards: TaskRewards
}

interface TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
}

type TaskObjectiveExperience implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #healthEffect: HealthEffect!
}

type TaskObjectiveExtract implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  exitStatus: [String]!
}

type TaskObjectiveQuestItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #questItem: QuestItem!
  count: Int!
}

type TaskObjectiveItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #item: Item!
  count: Int!
  foundInRaid: Boolean!
  dogTagLevel: Int
  maxDurability: Int
  minDurability: Int
}

type TaskObjectiveBasic implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
}

type TaskObjectiveBuildItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  item: Item!
  #containsAll: [Item]!
  #containsOne: [Item]!
  #accuracy: NumberCompare
  #durability: NumberCompare
  #effectiveDistance: NumberCompare
  #ergonomics: NumberCompare
  #height: NumberCompare
  #magazineCapacity: NumberCompare
  #muzzleVelocity: NumberCompare
  #recoil: NumberCompare
  #weight: NumberCompare
  #width: NumberCompare
}

type TaskObjectiveMark implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #markerItem: Item!
}

type TaskObjectivePlayerLevel implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  playerLevel: Int!
}

type TaskObjectiveShoot implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  target: String!
  count: Int!
  shotType: String!
  bodyParts = [String]!
  #usingWeapon [Item]
  #usingWeaponMods [ItemGroup]
  #distance: NumberCompare
  #healthEffect: HealthEffect
  #enemyHealthEffect: HealthEffect
}

type TaskObjectiveSkill implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #skillLevel: SkillLevel!
}

type TaskObjectiveTaskStatus implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #task: Task!
  status: [String]!
}

type TaskObjectiveTraderLevel implements TaskObjective {
  id: ID
  type: String!
  description: String!
  locationNames: [String]!
  optional: Boolean!
  #traderLevel: TraderLevel!
}

type QuestItem {
  id: ID!
  name: String!
}

type TaskRewards {
  #traderStanding: [TraderStanding]!
  #items: [ContainedItem]!
  #offerUnlock: [OfferUnlock]!
  #skillLevelReward: [SkillLevel]!
  #traderUnlock: [Trader]!
}

type TaskStatusRequirement {
  #task: Task!
  status: [String]!
}

type Trader {
  id: ID!
  name: String!
  resetTime: String
  #currency: Item!
  #levels: [TraderLevel!]!
}

type TraderLevel {
  id: ID!
  name: String!
  level: Int!
  requiredPlayerLevel: Int!
  requiredReputation: Float!
  requiredCommerce: Int!
  payRate: Float!
  insuranceRate: Float
  repairCostMultiplier: Float
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

type TraderStanding {
  trader: Trader!
  standing: Float!
}

"""
TraderResetTime is deprecated and replaced with Trader.
"""
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
  quests: [Quest] @deprecated(reason: "No longer maintained. Use tasks instead.")
  hideoutModules: [HideoutModule] @deprecated(reason: "No longer maintained. Use hideoutStations instead.")
  hideoutStations: [HideoutStation]!
  status: ServerStatus!
  tasks: [Task]!
  # traderInventoryByName(name: TraderName!): TraderInventory
  traderResetTimes: [TraderResetTime] @deprecated(reason: "Use traders instead.")
  traders: [Trader]!
  ammo: [Ammo]
}

"""
The below types are all deprecated and may not return current data.
"""
"""
HideoutModule has been replaced with HideoutStationLevel.
"""
type HideoutModule {
  id: Int @deprecated(reason: "Use HideoutStationLevel type instead.")
  name: String @deprecated(reason: "Use HideoutStationLevel type instead.")
  level: Int
  itemRequirements: [ContainedItem]!
  moduleRequirements: [HideoutModule]!
}

"""
Quest has been replaced with Task.
"""
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

"""
QuestObjective has been replaced with TaskObjective.
"""
type QuestObjective {
  id: String
  type: String!
  target: [String!]
  targetItem: Item
  number: Int
  location: String
}

"""
QuestRequirement has been replaced with TaskRequirement.
"""
type QuestRequirement {
  level: Int
  quests: [[Int]]!
  prerequisiteQuests: [[Quest]]!
}

type QuestRewardReputation {
  trader: Trader!
  amount: Float!
}
`;
