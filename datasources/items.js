const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

const availableProperties = [
    'weight',
    'velocity',
    'loudness',
];

function camelCase(input) {
    return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
        return group1.toUpperCase();
    });
}

function camelCaseToDash(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

class ItemsAPI {
    constructor() {
        this.itemCache = false;
        this.traderItemCache = false;
    }

    async init() {
        this.initTraders();
        if (this.itemCache) {
            return true;
        }

        try {
            this.itemCache = await ITEM_DATA.get('ITEM_CACHE', 'json');
        } catch (loadDataError) {
            console.error(loadDataError);
        }
    }

    async initTraders() {
        if (this.traderItemCache) {
            return true;
        }

        try {
            this.traderItemCache = await ITEM_DATA.get('TRADER_ITEMS', 'json');
        } catch (loadDataError) {
            console.error(loadDataError);
        }
    }

    formatItem(rawItem) {
        //console.log(rawItem);
        const item = {
            ...rawItem,
        };

        if (typeof item.avg24hPrice === 'undefined' && item.avg24Price) {
            item.avg24hPrice = item.avg24Price;
        }

        item.iconLink = item.icon_link;
        item.gridImageLink = item.grid_image_link;
        item.imageLink = item.image_link;
        item.basePrice = item.base_price;
        item.shortName = item.shortname;
        item.wikiLink = item.wiki_link;
        item.normalizedName = item.normalized_name;
        item.link = `https://tarkov-tools.com/item/${item.normalizedName}`;

        if (item.properties) {
            if (item.properties.accuracy) {
                item.accuracyModifier = Number(item.properties.accuracy);
            }

            if (item.properties.recoil) {
                item.recoilModifier = Number(item.properties.recoil);
            }

            if (item.properties.ergonomics) {
                item.ergonomicsModifier = Number(item.properties.ergonomics);
            }

            if (item.properties.grid && item.properties.grid.totalSize > 0) {
                item.hasGrid = true;
            }

            if (item.properties.blocksEarpiece) {
                item.blocksHeadphones = true;
            }

            if (item.properties.bsgCategoryId) {
                item.bsgCategoryId = item.properties.bsgCategoryId;
            }

            for (const availableProperty of availableProperties) {
                if (typeof item.properties[availableProperty] !== 'undefined') {
                    item[availableProperty] = Number(item.properties[availableProperty]);
                }
            }
        }

        item.formattedTypes = item.types.map(type => camelCase(type));
        item.types = item.formattedTypes;

        item.traderPrices = item.traderPrices.map((traderPrice) => {
            const targetTrader = tradersAPI.getByName(traderPrice.name);
            return {
                price: traderPrice.price,
                trader: targetTrader,
            };
        });

        item.sellFor = [
            ...item.traderPrices.map((traderPrice) => {
                return {
                    price: traderPrice.price,
                    source: String(traderPrice.trader.name != null ? traderPrice.trader.name : '').toLowerCase(),
                    requirements: [],
                };
            }),
        ];

        if (!item.types.includes('noFlea')) {
            item.sellFor.push({
                price: item.avg24hPrice,
                source: 'fleaMarket',
                currency: 'RUB',
                requirements: [{
                    type: 'playerLevel',
                    value: 15,
                }],
            });
        }

        item.buyFor = [
            ...this.getByItemId(item.id),
        ];

        if (!item.types.includes('noFlea')) {
            item.buyFor.push({
                price: item.avg24hPrice,
                source: 'fleaMarket',
                currency: 'RUB',
                requirements: [{
                    type: 'playerLevel',
                    value: 15,
                }],
            });
        }

        // Fallback images
        item.imageLinkFallback = item.imageLink || 'https://assets.tarkov-tools.com/unknown-item-image.jpg';
        item.iconLinkFallback = item.iconLink || 'https://assets.tarkov-tools.com/unknown-item-icon.jpg';
        item.gridImageLinkFallback = item.gridImageLink || 'https://assets.tarkov-tools.com/unknown-item-grid-image.jpg';


        if (item.containsItems && item.containsItems.length > 0) {
            item.containsItems = item.containsItems.map((containedItem) => {
                return {
                    item: this.formatItem(this.itemCache[containedItem.itemId]),
                    count: containedItem.count,
                    quantity: containedItem.count,
                };
            });
        }

        return item;
    }

    async getItem(id) {
        let item = this.itemCache[id];

        if (!item) {
            item = await ITEM_DATA.get(id, 'json');
        }

        if (!item) {
            return {};
        }

        return this.formatItem(item);
    }

    getItemsByType(type) {
        return Object.values(this.itemCache)
            .filter((rawItem) => {
                return rawItem.types.includes(camelCaseToDash(type)) || type === 'any';
            })
            .map((rawItem) => {
                return this.formatItem(rawItem);
            });
    }

    getItemsByName(name) {
        const searchString = name.toLowerCase();

        return Object.values(this.itemCache)
            .filter((rawItem) => {
                return rawItem.name.toLowerCase().includes(searchString) || rawItem.shortname.toLowerCase().includes(searchString);
            })
            .map((rawItem) => {
                return this.formatItem(rawItem);
            });
    }

    getItemsByBsgCategoryId(bsgCategoryId) {
        return Object.values(this.itemCache)
            .filter((rawItem) => {
                if (!rawItem.properties) {
                    return false;
                }

                return rawItem.properties.bsgCategoryId === bsgCategoryId;
            })
            .map((rawItem) => {
                return this.formatItem(rawItem)
            });
    }

    getItemByNormalizedName(normalizedName) {
        const item = Object.values(this.itemCache).find((item) => item.normalized_name === normalizedName);

        if (!item) {
            return null;
        }

        return this.formatItem(item);
    }

    getByItemId(itemId) {
        if (!this.traderItemCache[itemId]) {
            return [];
        }

        return this.traderItemCache[itemId].map((cacheData) => {
            const newItem = {
                source: cacheData.source,
                price: cacheData.price,
                currency: cacheData.currency,
                requirements: [{
                    type: 'loyaltyLevel',
                    value: cacheData.min_level,
                }]
            };

            if (cacheData.quest_unlock) {
                newItem.requirements.push({
                    type: 'questCompleted',
                    value: Number(cacheData.quest_unlock_id) || 1,
                });
            }

            return newItem;
        });
    }
}

module.exports = ItemsAPI