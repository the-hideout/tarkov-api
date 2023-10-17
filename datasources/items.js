const WorkerKV = require('../utils/worker-kv');

class ItemsAPI extends WorkerKV {
    constructor(dataSource) {
        super('item_data', dataSource);
    }

    postLoad() {
        for (const item of Object.values(this.cache.Item)) {
            // add trader prices to sellFor
            item.sellFor = item.traderPrices.map((traderPrice) => {
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
                    source: traderPrice.source,
                    requirements: [],
                };
            });

            item.buyFor = [];
            // add flea prices to sellFor and buyFor
            if (!item.types.includes('noFlea') && item.lastLowPrice) {
                item.sellFor.push({
                    price: item.lastLowPrice || 0,
                    currency: 'RUB',
                    currencyItem: '5449016a4bdc2d6f028b456f',
                    priceRUB: item.lastLowPrice || 0,
                    vendor: this.cache.FleaMarket,
                    source: 'fleaMarket',
                    requirements: [{
                        type: 'playerLevel',
                        value: this.cache.FleaMarket.minPlayerLevel,
                    }],
                });

                item.buyFor.push({
                    price: item.avg24hPrice || item.lastLowPrice || 0,
                    currency: 'RUB',
                    currencyItem: '5449016a4bdc2d6f028b456f',
                    priceRUB: item.avg24hPrice || item.lastLowPrice || 0,
                    vendor: this.cache.FleaMarket,
                    source: 'fleaMarket',
                    requirements: [{
                        type: 'playerLevel',
                        value: this.cache.FleaMarket.minPlayerLevel,
                    }],
                });
            }
        }
    }

    async getItem(context, id, contains) {
        await this.init(context);
        let item = this.cache.Item[id];
        if (!item) {
            return Promise.reject(new Error(`No item found with id ${id}`));
        }

        if (contains && Array.isArray(contains)) {
            item.containsItems = contains.map((cItem) => {
                if (!cItem.attributes) cItem.attributes = [];
                if (!cItem.count) cItem.count = 1;
                return cItem;
            });
        }
        return item;
    }

    async getAllItems(context) {
        await this.init(context);
        return Object.values(this.cache.Item);
    }

    async getItemsByIDs(context, ids, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter((item) => ids.includes(item.id));
    }

    async getItemsByType(context, type, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter((item) => item.types.includes(type) || type === 'any');
    }

    async getItemsByTypes(context, types, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        if (types.includes('any')) {
            return items;
        }
        return items.filter((item) => types.some(type => item.types.includes(type)));
    }

    async getItemsByName(context, name, info, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        const searchString = name.toLowerCase();
        if (searchString === '') return Promise.reject(new Error('Searched item name cannot be blank'));

        return items.filter((item) => {
            if (this.getLocale(item.name, context, info).toString().toLowerCase().includes(searchString)) {
                return true;
            }
            if (this.getLocale(item.shortName, context, info).toString().toLowerCase().includes(searchString)) {
                return true;
            }
            return false;
        });
    }

    async getItemsByNames(context, names, info, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched item name cannot be blank');
            return name.toLowerCase();
        });
        return items.filter((item) => {
            for (const search of searchStrings) {
                if (this.getLocale(item.name, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
                if (this.getLocale(item.shortName, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        });
    }

    async getItemsByBsgCategoryId(context, bsgCategoryId, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter((item) => item.bsgCategoryId === bsgCategoryId);
    }

    async getItemsByBsgCategoryIds(context, bsgCategoryIds, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter((item) => bsgCategoryIds.some(catId => catId === item.bsgCategoryId));
    }

    async getItemsByCategoryEnums(context, names, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        const categories = (await this.getCategories()).filter(cat => names.includes(cat.enumName));
        return items.filter((item) => {
            return item.categories.some(catId => categories.some(cat => cat.id === catId));
        });
    }

    async getItemsByHandbookCategoryEnums(context, names, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        const categories = (await this.getHandbookCategories()).filter(cat => names.includes(cat.enumName));
        return items.filter((item) => {
            return item.handbookCategories.some(catId => categories.some(cat => cat.id === catId));
        });
    }

    async getItemsInBsgCategory(context, bsgCategoryId, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter(item => item.categories.includes(bsgCategoryId));
    }

    async getItemByNormalizedName(context, normalizedName) {
        await this.init(context);
        const item = Object.values(this.cache.Item).find((item) => item.normalized_name === normalizedName);

        if (!item) {
            return null;
        }

        return item;
    }

    async getItemsByDiscardLimitedStatus(context, limited, items = false) {
        await this.init(context);
        if (!items) {
            items = Object.values(this.cache.Item);
        }
        return items.filter(item => {
            return (item.discardLimit > -1 && limited) || (item.discardLimit == -1 && !limited);
        });
    }

    async getCategory(context, id) {
        await this.init(context);
        return this.cache.ItemCategory[id] || this.cache.HandbookCategory[id];
    }

    async getTopCategory(context, id) {
        await this.init(context);
        const cat = await this.getCategory(id);
        if (cat && cat.parent_id) return this.getTopCategory(cat.parent_id);
        return cat;
    }

    async getCategories(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Item cache is empty'));
        }
        const categories = [];
        for (const id in this.cache.ItemCategory) {
            categories.push(this.cache.ItemCategory[id]);
        }
        return categories;
    }

    async getCategoriesEnum(context) {
        const cats = await this.getCategories(context);
        const map = {};
        for (const id in cats) {
            map[cats[id].enumName] = cats[id];
        }
        return map;
    }

    async getHandbookCategory(context, id) {
        await this.init(context);
        return this.cache.HandbookCategory[id];
    }

    async getHandbookCategories(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Item cache is empty'));
        }
        return Object.values(this.cache.HandbookCategory);
    }

    async getFleaMarket(context) {
        await this.init(context);
        return this.cache.FleaMarket;
    }

    async getArmorMaterials(context) {
        await this.init(context);
        return Object.values(this.cache.ArmorMaterial).sort();
    }

    async getArmorMaterial(context, matKey) {
        await this.init(context);
        return this.cache.ArmorMaterial[matKey];
    }

    async getAmmoList(context) {
        const allAmmo = await this.getItemsByBsgCategoryId(context, '5485a8684bdc2da71d8b4567').then(ammoItems => {
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

    async getPlayerLevels(context) {
        await this.init(context);
        return this.cache.PlayerLevel;
    }

    async getTypes(context) {
        await this.init(context);
        return this.cache.ItemType;
    }

    async getLanguageCodes(context) {
        await this.init(context);
        return this.cache.LanguageCode;
    }
}

module.exports = ItemsAPI;
