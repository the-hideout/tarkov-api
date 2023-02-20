module.exports = `
type Ammo {
  item: Item!
  weight: Float!
  caliber: String
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
  accuracy: Int @deprecated(reason: "Use accuracyModifier instead.")
  accuracyModifier: Float
  recoil: Int @deprecated(reason: "Use recoilModifier instead.")
  recoilModifier: Float
  initialSpeed: Float
  lightBleedModifier: Float!
  heavyBleedModifier: Float!
  staminaBurnPerDamage: Float
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

type ArmorMaterial {
  id: String
  name: String
  destructibility: Float
  minRepairDegradation: Float
  maxRepairDegradation: Float
  explosionDestructibility: Float
  minRepairKitDegradation: Float
  maxRepairKitDegradation: Float
}

type AttributeThreshold {
  name: String!
  requirement: NumberCompare!
}

type Barter {
  id: ID!
  trader: Trader!
  level: Int!
  taskUnlock: Task
  requiredItems: [ContainedItem]!
  rewardItems: [ContainedItem]!
  source: String! @deprecated(reason: "Use trader and level instead.")
  sourceName: ItemSourceName! @deprecated(reason: "Use trader instead.")
  requirements: [PriceRequirement]! @deprecated(reason: "Use level instead.")
}

type BossSpawn {
  boss: MobInfo!
  spawnChance: Float!
  spawnLocations: [BossSpawnLocation]!
  escorts: [BossEscort]!
  spawnTime: Int
  spawnTimeRandom: Boolean
  spawnTrigger: String
  name: String! @deprecated(reason: "Use boss.name instead.")
  normalizedName: String! @deprecated(reason: "Use boss.normalizedName instead.")
}

type BossEscort {
  boss: MobInfo!
  amount: [BossEscortAmount]
  name: String! @deprecated(reason: "Use boss.name instead.")
  normalizedName: String! @deprecated(reason: "Use boss.normalizedName instead.")
}

type BossEscortAmount {
  count: Int!
  chance: Float!
}

"""
The chances of spawning in a given location are 
very rough estimates and may be incaccurate
"""
type BossSpawnLocation {
  name: String!
  chance: Float!
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
  taskUnlock: Task
  duration: Int!
  requiredItems: [ContainedItem]!
  requiredQuestItems: [QuestItem]!
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
  normalizedName: String!
  minPlayerLevel: Int!
  enabled: Boolean!
  sellOfferFeeRate: Float!
  sellRequirementFeeRate: Float!
  reputationLevels: [FleaMarketReputationLevel]!
}

type FleaMarketReputationLevel {
  offers: Int!
  minRep: Float!
  maxRep: Float!
}

type HealthEffect {
  bodyParts: [String]!
  effects: [String]!
  time: NumberCompare
}

type HealthPart {
  id: ID!
  max: Int!
  bodyPart: String!
}

type HideoutStation {
  id: ID!
  name: String!
  normalizedName: String!
  levels: [HideoutStationLevel]!
  tarkovDataId: Int
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
  tarkovDataId: Int
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
  description: String
  basePrice: Int!
  updated: String
  width: Int!
  height: Int!
  backgroundColor: String!
  iconLink: String
  gridImageLink: String
  baseImageLink: String
  inspectImageLink: String
  image512pxLink: String
  image8xLink: String
  wikiLink: String
  types: [ItemType]!
  avg24hPrice: Int
  properties: ItemProperties
  conflictingItems: [Item]
  conflictingSlotIds: [String]
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
  lastOfferCount: Int
  sellFor: [ItemPrice!]
  buyFor: [ItemPrice!]
  containsItems: [ContainedItem]
  category: ItemCategory
  categories: [ItemCategory]!
  bsgCategoryId: String
  handbookCategories: [ItemCategory]!
  weight: Float
  velocity: Float
  loudness: Int
  #discardLimit: Int
  usedInTasks: [Task]!
  receivedFromTasks: [Task]!
  bartersFor: [Barter]!
  bartersUsing: [Barter]!
  craftsFor: [Craft]!
  craftsUsing: [Craft]!
  "historicalPrices is only available via the item and items queries."
  historicalPrices: [historicalPricePoint]
  fleaMarketFee(price: Int, intelCenterLevel: Int, hideoutManagementLevel: Int, count: Int, requireAll: Boolean): Int
  categoryTop: ItemCategory @deprecated(reason: "No longer meaningful with inclusion of Item category.")
  translation(languageCode: LanguageCode): ItemTranslation @deprecated(reason: "Use the lang argument on queries instead.")
  traderPrices: [TraderPrice]! @deprecated(reason: "Use sellFor instead.")
  bsgCategory: ItemCategory @deprecated(reason: "Use category instead.")
  imageLink: String @deprecated(reason: "Use inspectImageLink instead.")
  imageLinkFallback: String! @deprecated(reason: "Fallback handled automatically by inspectImageLink.")
  iconLinkFallback: String! @deprecated(reason: "Fallback handled automatically by iconLink.")
  gridImageLinkFallback: String! @deprecated(reason: "Fallback handled automatically by gridImageLink.")
}

type ItemAttribute {
  type: String!
  name: String!
  value: String
}

type ItemCategory {
  id: ID!
  name: String!
  normalizedName: String!
  parent: ItemCategory
  children: [ItemCategory]
}

type ItemFilters {
  allowedCategories: [ItemCategory]!
  allowedItems: [Item]!
  excludedCategories: [ItemCategory]!
  excludedItems: [Item]!
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

type ItemPropertiesAmmo {
  caliber: String
  stackMaxSize: Int
  tracer: Boolean
  tracerColor: String
  ammoType: String
  projectileCount: Int
  damage: Int
  armorDamage: Int
  fragmentationChance: Float
  ricochetChance: Float
  penetrationChance: Float
  penetrationPower: Int
  accuracy: Int @deprecated(reason: "Use accuracyModifier instead.")
  accuracyModifier: Float
  recoil: Float @deprecated(reason: "Use recoilModifier instead.")
  recoilModifier: Float
  initialSpeed: Float
  lightBleedModifier: Float
  heavyBleedModifier: Float
  durabilityBurnFactor: Float
  heatFactor: Float
  staminaBurnPerDamage: Float
}

type ItemPropertiesArmor {
  class: Int
  durability: Int
  repairCost: Int
  speedPenalty: Float
  turnPenalty: Float
  ergoPenalty: Int
  zones: [String]
  material: ArmorMaterial
  armorType: String
}

type ItemPropertiesArmorAttachment {
  class: Int
  durability: Int
  repairCost: Int
  speedPenalty: Float
  turnPenalty: Float
  ergoPenalty: Int
  headZones: [String]
  material: ArmorMaterial
  blindnessProtection: Float
}

type ItemPropertiesBackpack {
  capacity: Int
  grids: [ItemStorageGrid]
  pouches: [ItemStorageGrid] @deprecated(reason: "Use grids instead.")
}

type ItemPropertiesBarrel {
  ergonomics: Float
  recoil: Float @deprecated(reason: "Use recoilModifier instead.")
  recoilModifier: Float
  accuracyModifier: Float @deprecated(reason: "Use centerOfImpact, deviationCurve, and deviationMax instead.")
  centerOfImpact: Float
  deviationCurve: Float
  deviationMax: Float
  slots: [ItemSlot]
}

type ItemPropertiesChestRig {
  class: Int
  durability: Int
  repairCost: Int
  speedPenalty: Float
  turnPenalty: Float
  ergoPenalty: Int
  zones: [String]
  material: ArmorMaterial
  capacity: Int
  grids: [ItemStorageGrid]
  pouches: [ItemStorageGrid] @deprecated(reason: "Use grids instead.")
  armorType: String
}

type ItemPropertiesContainer {
  capacity: Int
  grids: [ItemStorageGrid]
}

type ItemPropertiesFoodDrink {
  energy: Int
  hydration: Int
  units: Int
  stimEffects: [StimEffect]!
}

type ItemPropertiesGlasses {
  class: Int
  durability: Int
  repairCost: Int
  blindnessProtection: Float
  #speedPenalty: Float
  #turnPenalty: Float
  #ergoPenalty: Int
  material: ArmorMaterial
}

type ItemPropertiesGrenade {
  type: String
  fuse: Float
  minExplosionDistance: Int
  maxExplosionDistance: Int
  fragments: Int
  contusionRadius: Int
}

type ItemPropertiesHelmet {
  class: Int
  durability: Int
  repairCost: Int
  speedPenalty: Float
  turnPenalty: Float
  ergoPenalty: Int
  headZones: [String]
  material: ArmorMaterial
  deafening: String
  blocksHeadset: Boolean
  blindnessProtection: Float
  slots: [ItemSlot]
  ricochetX: Float
  ricochetY: Float
  ricochetZ: Float
  armorType: String
}

type ItemPropertiesKey {
  uses: Int
}

type ItemPropertiesMagazine {
  ergonomics: Float
  recoil: Float @deprecated(reason: "Use recoilModifier instead.")
  recoilModifier: Float
  capacity: Int
  loadModifier: Float
  ammoCheckModifier: Float
  malfunctionChance: Float
  slots: [ItemSlot]
  allowedAmmo: [Item]
}

type ItemPropertiesMedicalItem {
  uses: Int
  useTime: Int
  cures: [String]
}

type ItemPropertiesMedKit {
  hitpoints: Int
  useTime: Int
  maxHealPerUse: Int
  cures: [String]
  hpCostLightBleeding: Int
  hpCostHeavyBleeding: Int
}

type ItemPropertiesMelee {
  slashDamage: Int
  stabDamage: Int
  hitRadius: Float
}

type ItemPropertiesNightVision {
  intensity: Float
  noiseIntensity: Float
  noiseScale: Float
  diffuseIntensity: Float
}

type ItemPropertiesPainkiller {
  uses: Int
  useTime: Int
  cures: [String]
  painkillerDuration: Int
  energyImpact: Int
  hydrationImpact: Int
}

type ItemPropertiesPreset {
  baseItem: Item!
  ergonomics: Float
  recoilVertical: Int
  recoilHorizontal: Int
  moa: Float
  default: Boolean
}

type ItemPropertiesScope {
  ergonomics: Float
  sightModes: [Int]
  recoil: Float @deprecated(reason: "Use recoilModifier instead.")
  sightingRange: Int
  recoilModifier: Float
  slots: [ItemSlot]
  zoomLevels: [[Float]]
}

type ItemPropertiesStim {
  useTime: Int
  cures: [String]
  stimEffects: [StimEffect]!
}

type ItemPropertiesSurgicalKit {
  uses: Int
  useTime: Int
  cures: [String]
  minLimbHealth: Float
  maxLimbHealth: Float
}

type ItemPropertiesWeapon {
  caliber: String
  defaultAmmo: Item
  effectiveDistance: Int
  ergonomics: Float
  fireModes: [String]
  fireRate: Int
  maxDurability: Int
  recoilVertical: Int
  recoilHorizontal: Int
  repairCost: Int
  sightingRange: Int
  centerOfImpact: Float
  deviationCurve: Float
  deviationMax: Float
  defaultWidth: Int
  defaultHeight: Int
  defaultErgonomics: Float,
  defaultRecoilVertical: Int
  defaultRecoilHorizontal: Int
  defaultWeight: Float
  defaultPreset: Item
  presets: [Item]
  slots: [ItemSlot]
  allowedAmmo: [Item]
}

type ItemPropertiesWeaponMod {
  ergonomics: Float
  recoil: Float @deprecated(reason: "Use recoilModifier instead.")
  recoilModifier: Float
  accuracyModifier: Float
  slots: [ItemSlot]
}

union ItemProperties = 
  ItemPropertiesAmmo | 
  ItemPropertiesArmor | 
  ItemPropertiesArmorAttachment | 
  ItemPropertiesBackpack | 
  ItemPropertiesBarrel | 
  ItemPropertiesChestRig | 
  ItemPropertiesContainer | 
  ItemPropertiesFoodDrink | 
  ItemPropertiesGlasses | 
  ItemPropertiesGrenade | 
  ItemPropertiesHelmet | 
  ItemPropertiesKey | 
  ItemPropertiesMagazine | 
  ItemPropertiesMedicalItem | 
  ItemPropertiesMelee | 
  ItemPropertiesMedKit | 
  ItemPropertiesNightVision | 
  ItemPropertiesPainkiller | 
  ItemPropertiesPreset |
  ItemPropertiesScope | 
  ItemPropertiesSurgicalKit | 
  ItemPropertiesWeapon | 
  ItemPropertiesWeaponMod |
  ItemPropertiesStim

type ItemSlot {
  id: ID!
  name: String!
  nameId: String!
  filters: ItemFilters
  required: Boolean
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

type ItemStorageGrid {
  width: Int!
  height: Int!
  filters: ItemFilters!
}

type Map {
  id: ID!
  tarkovDataId: ID
  name: String!
  normalizedName: String!
  wiki: String
  description: String
  enemies: [String]
  raidDuration: Int
  players: String
  bosses: [BossSpawn]!
  nameId: String
  #svg: MapSvg
}

#type MapSvg {
#  file: String
#  floors: [String]
#  defaultFloor: String
#}

type MobInfo {
  id: ID!
  name: String!
  normalizedName: String!
  health: [HealthPart]
  imagePortraitLink: String
  imagePosterLink: String
  "equipment and items are estimates and may be inaccurate."
  equipment: [ContainedItem]!
  items: [Item]!
}

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

type PlayerLevel {
  level: Int!
  exp: Int!
}

type PriceRequirement {
  type: RequirementType!
  value: Int
  stringValue: String
}

type QuestItem {
  id: ID
  name: String!
  shortName: String
  description: String
  normalizedName: String
  width: Int
  height: Int
  iconLink: String
  gridImageLink: String
  baseImageLink: String
  inspectImageLink: String
  image512pxLink: String
  image8xLink: String
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
  requirementType: String!
  compareMethod: String!
  value: Int!
  level: Int @deprecated(reason: "Use requirement instead.")
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

type StimEffect {
  type: String!
  chance: Float!
  delay: Int!
  duration: Int!
  value: Float!
  percent: Boolean!
  skillName: String
}

type Task {
  id: ID
  tarkovDataId: Int
  name: String!
  normalizedName: String!
  trader: Trader!
  #locationName: String!
  map: Map
  experience: Int!
  wikiLink: String
  minPlayerLevel: Int
  taskRequirements: [TaskStatusRequirement]!
  traderRequirements: [RequirementTrader]!
  objectives: [TaskObjective]!
  startRewards: TaskRewards
  finishRewards: TaskRewards
  failConditions: [TaskObjective]!
  failureOutcome: TaskRewards
  restartable: Boolean
  factionName: String
  neededKeys: [TaskKey]
  kappaRequired: Boolean
  lightkeeperRequired: Boolean
  descriptionMessageId: String
  startMessageId: String
  successMessageId: String
  failMessageId: String
  traderLevelRequirements: [RequirementTrader]! @deprecated(reason: "Use traderRequirements instead.")
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
  containsCategory: [ItemCategory]!
  attributes: [AttributeThreshold]!
  containsOne: [Item]! @deprecated(reason: "Use containsCategory instead.")
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
  exitName: String
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
  usingWeaponMods: [[Item]]
  wearing: [[Item]]
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

type TaskObjectiveTraderStanding implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  trader: Trader!
  compareMethod: String!
  value: Int!
}

type TaskObjectiveUseItem implements TaskObjective {
  id: ID
  type: String!
  description: String!
  #locationNames: [String]!
  maps: [Map]!
  optional: Boolean!
  useAny: [Item]!
  compareMethod: String
  count: Int!
  zoneNames: [String]!
}

type TaskRewards {
  traderStanding: [TraderStanding]!
  items: [ContainedItem]!
  offerUnlock: [OfferUnlock]!
  skillLevelReward: [SkillLevel]!
  traderUnlock: [Trader]!
  craftUnlock: [Craft]!
}

type TaskStatusRequirement {
  task: Task!
  status: [String]!
}

type Trader {
  id: ID!
  name: String!
  normalizedName: String!
  description: String
  resetTime: String
  currency: Item!
  discount: Float!
  levels: [TraderLevel!]!
  "barters and cashOffers are only available via the traders query."
  barters: [Barter]!
  cashOffers: [TraderCashOffer]!
  imageLink: String
  image4xLink: String
  tarkovDataId: Int
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
  imageLink: String
  image4xLink: String
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
  normalizedName: String!
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
  normalizedName: String!
}
#union Vendor = TraderOffer | FleaMarket

type Query {
  ammo(lang: LanguageCode, limit: Int, offset: Int): [Ammo]  
  barters(lang: LanguageCode, limit: Int, offset: Int): [Barter]
  bosses(lang: LanguageCode, name: [String!], limit: Int, offset: Int): [MobInfo]
  crafts(lang: LanguageCode, limit: Int, offset: Int): [Craft]
  hideoutStations(lang: LanguageCode, limit: Int, offset: Int): [HideoutStation]!
  historicalItemPrices(id: ID!, lang: LanguageCode, limit: Int, offset: Int): [historicalPricePoint]!
  item(id: ID, normalizedName: String, lang: LanguageCode): Item
  items(ids: [ID], name: String, names: [String], type: ItemType, types: [ItemType], categoryNames: [ItemCategoryName], handbookCategoryNames: [HandbookCategoryName] bsgCategoryId: String, bsgCategoryIds: [String], bsgCategory: String, lang: LanguageCode, limit: Int, offset: Int): [Item]!
  itemCategories(lang: LanguageCode, limit: Int, offset: Int): [ItemCategory]!
  handbookCategories(lang: LanguageCode, limit: Int, offset: Int): [ItemCategory]!
  maps(lang: LanguageCode, name: [String!], enemies: [String!], limit: Int, offset: Int): [Map]!
  questItems(lang: LanguageCode): [QuestItem]
  status: ServerStatus!
  task(id: ID!, lang: LanguageCode): Task
  tasks(faction: String, lang: LanguageCode, limit: Int, offset: Int): [Task]!
  traders(lang: LanguageCode, limit: Int, offset: Int): [Trader]!
  fleaMarket(lang: LanguageCode): FleaMarket!
  armorMaterials(lang: LanguageCode): [ArmorMaterial]!
  playerLevels: [PlayerLevel]!
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
ItemTranslation has been replaced with the lang argument on all queries
"""
type ItemTranslation {
  name: String @deprecated(reason: "Use the lang argument on queries instead.")
  shortName: String @deprecated(reason: "Use the lang argument on queries instead.")
  description: String @deprecated(reason: "Use the lang argument on queries instead.")
}

"""
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
