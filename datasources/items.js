const TraderApi = require('./traders');
const traderApi = new TraderApi();

function camelCase(input) {
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

function camelCaseToDash(input) {
    return input.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

class ItemsAPI {
    constructor(){
        this.itemCache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if(this.itemCache){
                return true;
            }
            this.loading = ITEM_DATA.get('ITEM_CACHE_V2', 'json');
            this.itemCache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
    }

    formatItem(rawItem) {
        const item = {
            ...rawItem,
        };

        item.formattedTypes = item.types.map(type => camelCase(type));
        item.types = item.formattedTypes;

        const traderMap = traderApi.getNameIdMap();

        item.traderPrices = item.traderPrices.map((traderPrice) => {
            return {
                price: traderPrice.price,
                priceRUB: traderPrice.priceRUB,
                currency: traderPrice.currency,
                trader_name: traderPrice.name,
                trader: traderMap[traderPrice.name],
                trader_id: traderMap[traderPrice.name]
            };
        });

        item.sellFor = [
            ...item.traderPrices.map((traderPrice) => {
                let currency = 'RUB';
                if (traderPrice.trader_name.toLowerCase() === 'peacekeeper') currency = 'USD';
                // all trader sell values currently listed in RUB
                return {
                    price: traderPrice.price,
                    currency: currency,
                    priceRUB: traderPrice.priceRUB,
                    vendor: {
                        trader: traderMap[traderPrice.trader_name],
                        trader_id: traderMap[traderPrice.trader_name],
                        traderLevel: 1,
                        minTraderLevel: 1,
                        taskUnlock: null
                    },
                    source: traderPrice.trader_name.toLowerCase(),
                    requirements: [],
                };
            }),
        ];

        item.buyFor = [];

        if(!item.types.includes('noFlea') && !item.types.includes('preset')){
            item.sellFor.push({
                price: item.lastLowPrice || 0,
                currency: 'RUB',
                currencyItem: '5449016a4bdc2d6f028b456f',
                priceRUB: item.lastLowPrice || 0,
                vendor: this.itemCache.flea,
                source: 'fleaMarket',
                requirements: [{
                    type: 'playerLevel',
                    value: this.itemCache.flea.minPlayerLevel,
                }],
            });

            item.buyFor.push({
                price: item.avg24hPrice || item.lastLowPrice || 0,
                currency: 'RUB',
                currencyItem: '5449016a4bdc2d6f028b456f',
                priceRUB: item.avg24hPrice || item.lastLowPrice || 0,
                vendor: this.itemCache.flea,
                source: 'fleaMarket',
                requirements: [{
                    type: 'playerLevel',
                    value: this.itemCache.flea.minPlayerLevel,
                }],
            });
        }

        return item;
    }

    async getItem(id, contains) {
        await this.init();
        let item = this.itemCache.data[id];
        if(!item){
            item = await ITEM_DATA.get(id, 'json');
        }

        if(!item){
            return {};
        }

        const formatted = await this.formatItem(item);
        if (contains && Array.isArray(contains)) {
            formatted.containsItems = contains.map((cItem) => {
                return {
                    ...cItem,
                    attributes: []
                }
            });
        }
        return formatted;
    }

    async getAllItems() {
        await this.init();
        return Object.values(this.itemCache.data).map((rawItem) => {
            return this.formatItem(rawItem);
        });
    }

    async getItemsByIDs(ids, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            return ids.includes(rawItem.id);
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByType(type, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            return rawItem.types.includes(camelCaseToDash(type)) || type === 'any';
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByName(name, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        const searchString = name.toLowerCase();

        return items.filter((rawItem) => {
            if (!rawItem.name || !rawItem.shortname) return false;
            return rawItem.name.toLowerCase().includes(searchString) || rawItem.shortname.toLowerCase().includes(searchString);
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
}

    async getItemsByNames(names, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        const searchStrings = names.map(name => {
            return name.toLowerCase();
        });
        return items.filter((rawItem) => {
            for (const search of searchStrings) {
                if (rawItem.name.toLowerCase().includes(search) || rawItem.shortname.toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByBsgCategoryId(bsgCategoryId, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            if (!rawItem.properties) {
                return false;
            }

            return rawItem.properties.bsgCategoryId === bsgCategoryId;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsInBsgCategory(bsgCategoryId, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        const categories = [
            bsgCategoryId,
            ...this.getSubCategories(bsgCategoryId)
        ];
        return items.filter(item => {
            if (!item.properties) return false;
            return categories.includes(item.properties.bsgCategoryId);
        }).map(item => {
            if (!format) return item;
            return this.formatItem(item);
        });
    }

    getSubCategories(id) {
        const subCats = [];
        for (const catId in this.itemCache.categories) {
            const cat = this.itemCache.categories[catId];
            if (cat.parent_id === id) {
                subCats.push(cat.id);
                subCats.push(...this.getSubCategories(cat.id));
            }
        }
        return subCats;
    }

    async getItemByNormalizedName(normalizedName) {
        await this.init();
        const item = Object.values(this.itemCache.data).find((item) => item.normalized_name === normalizedName);

        if (!item) {
            return null;
        }

        return this.formatItem(item);
    }

    async getItemsByDiscardLimitedStatus(limited, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.itemCache.data);
            format = true;
        }
        return items.filter(item => {
            return (item.discardLimit > -1 && limited) || (item.discardLimit == -1 && !limited);
        }).map(item => {
            if (!format) return item;
            return this.formatItem(item);
        });
    }

    async getCategory(id) {
        await this.init();
        return this.itemCache.categories[id];
    }

    async getCategories() {
        await this.init();
        const categories = [];
        for (const id in this.itemCache.categories) {
            categories.push(this.itemCache.categories[id]);
        }
        return categories;
    }

    async getFleaMarket() {
        await this.init();
        return this.itemCache.flea;
    }
}

module.exports = ItemsAPI
