const WorkerKV = require('../utils/worker-kv');

class ItemsAPI extends WorkerKV {
    constructor() {
        super('item_data');
    }

    formatItem(rawItem) {
        const item = {
            ...rawItem,
        };

        // add trader prices to sellFor
        item.sellFor = [
            ...item.traderPrices.map((traderPrice) => {
                return {
                    price: traderPrice.price,
                    currency: traderPrice.currency,
                    currencyItem: traderPrice.currencyItem,
                    priceRUB: traderPrice.priceRUB,
                    vendor: {
                        trader: traderPrice.trader,
                        trader_id: traderPrice.trader,
                        traderLevel: 1,
                        minTraderLevel: 1,
                        taskUnlock: null
                    },
                    source: traderPrice.name.toLowerCase(),
                    requirements: [],
                };
            }),
        ];

        item.buyFor = [];

        // add flea prices to sellFor and buyFor
        if (!item.types.includes('noFlea') && !item.types.includes('preset')) {
            item.sellFor.push({
                price: item.lastLowPrice || 0,
                currency: 'RUB',
                currencyItem: '5449016a4bdc2d6f028b456f',
                priceRUB: item.lastLowPrice || 0,
                vendor: this.cache.flea,
                source: 'fleaMarket',
                requirements: [{
                    type: 'playerLevel',
                    value: this.cache.flea.minPlayerLevel,
                }],
            });

            item.buyFor.push({
                price: item.avg24hPrice || item.lastLowPrice || 0,
                currency: 'RUB',
                currencyItem: '5449016a4bdc2d6f028b456f',
                priceRUB: item.avg24hPrice || item.lastLowPrice || 0,
                vendor: this.cache.flea,
                source: 'fleaMarket',
                requirements: [{
                    type: 'playerLevel',
                    value: this.cache.flea.minPlayerLevel,
                }],
            });
        }

        return item;
    }

    async getItem(id, contains) {
        await this.init();
        let item = this.cache.data[id];
        if (!item) {
            return Promise.reject(new Error(`No item found with id ${id}`));
        }

        const formatted = this.formatItem(item);
        if (contains && Array.isArray(contains)) {
            formatted.containsItems = contains.map((cItem) => {
                if (!cItem.attributes) cItem.attributes = [];
                if (!cItem.count) cItem.count = 1;
                return cItem;
            });
        }
        return formatted;
    }

    async getAllItems() {
        await this.init();
        return Object.values(this.cache.data).map((rawItem) => {
            return this.formatItem(rawItem);
        });
    }

    async getItemsByIDs(ids, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
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
            items = Object.values(this.cache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            return rawItem.types.includes(type) || type === 'any';
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByTypes(types, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            for (const type of types) {
                if (rawItem.types.includes(type) || type === 'any') return true;
            }
            return false;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByName(name, items = false, lang = 'en') {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        const searchString = name.toLowerCase();
        if (searchString === '') return Promise.reject(new Error('Searched item name cannot be blank'));

        return items.filter((rawItem) => {
            if (!rawItem.locale || !rawItem.locale[lang]) return false;
            if (rawItem.locale[lang].name && rawItem.locale[lang].name.toString().toLowerCase().includes(searchString)) {
                return true;
            }
            if (rawItem.locale[lang].shortName && rawItem.locale[lang].shortName.toString().toLowerCase().includes(searchString)) {
                return true;
            }
            return false;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByNames(names, items = false, lang = 'en') {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched item name cannot be blank');
            return name.toLowerCase();
        });
        return items.filter((rawItem) => {
            if (!rawItem.locale || !rawItem.locale[lang]) return false;
            for (const search of searchStrings) {
                if (rawItem.locale[lang].name && rawItem.locale[lang].name.toString().toLowerCase().includes(search)) {
                    return true;
                }
                if (rawItem.locale[lang].shortName && rawItem.locale[lang].shortName.toString().toLowerCase().includes(search)) {
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
            items = Object.values(this.cache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            return rawItem.bsgCategoryId === bsgCategoryId;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsByBsgCategoryIds(bsgCategoryIds, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        return items.filter((rawItem) => {
            return bsgCategoryIds.some(catId => catId === rawItem.bsgCategoryId);
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsByCategoryEnums(names, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        const categories = (await this.getCategories()).filter(cat => names.includes(cat.enumName));
        return items.filter((rawItem) => {
            return rawItem.categories.some(catId => categories.some(cat => cat.id === catId));
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsByHandbookCategoryEnums(names, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        const categories = (await this.getHandbookCategories()).filter(cat => names.includes(cat.enumName));
        return items.filter((rawItem) => {
            return rawItem.categories.some(catId => categories.some(cat => cat.id === catId));
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsInBsgCategory(bsgCategoryId, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
            format = true;
        }
        return items.filter(item => {
            return item.categories.includes(bsgCategoryId);
        }).map(item => {
            if (!format) return item;
            return this.formatItem(item);
        });
    }

    async getItemByNormalizedName(normalizedName) {
        await this.init();
        const item = Object.values(this.cache.data).find((item) => item.normalized_name === normalizedName);

        if (!item) {
            return null;
        }

        return this.formatItem(item);
    }

    async getItemsByDiscardLimitedStatus(limited, items = false) {
        await this.init();
        let format = false;
        if (!items) {
            items = Object.values(this.cache.data);
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
        return this.cache.categories[id] || this.cache.handbookCategories[id];
    }

    async getTopCategory(id) {
        await this.init();
        const cat = await this.getCategory(id);
        if (cat && cat.parent_id) return this.getTopCategory(cat.parent_id);
        return cat;
    }

    async getCategories() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Item cache is empty'));
        }
        const categories = [];
        for (const id in this.cache.categories) {
            categories.push(this.cache.categories[id]);
        }
        return categories;
    }

    async getCategoriesEnum() {
        const cats = await this.getCategories();
        const map = {};
        for (const id in cats) {
            map[cats[id].enumName] = cats[id];
        }
        return map;
    }

    async getHandbookCategory(id) {
        await this.init();
        return this.cache.handbookCategories[id];
    }

    async getHandbookCategories() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Item cache is empty'));
        }
        return Object.values(this.cache.handbookCategories);
    }

    async getFleaMarket() {
        await this.init();
        return this.cache.flea;
    }

    async getArmorMaterials() {
        await this.init();
        return Object.values(this.cache.armorMats).sort();
    }

    async getArmorMaterial(matKey) {
        await this.init();
        return this.cache.armorMats[matKey];
    }

    async getAmmoList() {
        const allAmmo = await this.getItemsByBsgCategoryId('5485a8684bdc2da71d8b4567').then(ammoItems => {
            // ignore bb
            return ammoItems.filter(item => item.id !== '6241c316234b593b5676b637');
        });
        return allAmmo.map(item => {
            return {
                ...item,
                ...item.properties
            };
        });
    }

    async getPlayerLevels() {
        await this.init();
        return this.cache.playerLevels;
    }

    async getTypes() {
        await this.init();
        return this.cache.types;
    }

    async getLanguageCodes() {
        await this.init();
        return this.cache.languageCodes;
    }
}

module.exports = ItemsAPI;
