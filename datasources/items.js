const WorkerKV = require('../utils/worker-kv');

class ItemsAPI extends WorkerKV {
    constructor(dataSource) {
        super('item_data', dataSource);
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

        return item;
    }

    async getItem(context, id, contains) {
        await this.init(context);
        let item = this.cache.Item[id];
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

    async getAllItems(context) {
        await this.init(context);
        return Object.values(this.cache.Item).map((rawItem) => {
            return this.formatItem(rawItem);
        });
    }

    async getItemsByIDs(context, ids, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter((rawItem) => {
            return ids.includes(rawItem.id);
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByType(context, type, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter((rawItem) => {
            return rawItem.types.includes(type) || type === 'any';
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByTypes(context, types, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
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

    async getItemsByName(context, name, info, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        const searchString = name.toLowerCase();
        if (searchString === '') return Promise.reject(new Error('Searched item name cannot be blank'));

        return items.filter((rawItem) => {
            if (this.getLocale(rawItem.name, context, info).toString().toLowerCase().includes(searchString)) {
                return true;
            }
            if (this.getLocale(rawItem.shortName, context, info).toString().toLowerCase().includes(searchString)) {
                return true;
            }
            return false;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByNames(context, names, info, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched item name cannot be blank');
            return name.toLowerCase();
        });
        return items.filter((rawItem) => {
            for (const search of searchStrings) {
                if (this.getLocale(rawItem.name, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
                if (this.getLocale(rawItem.shortName, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem);
        });
    }

    async getItemsByBsgCategoryId(context, bsgCategoryId, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter((rawItem) => {
            return rawItem.bsgCategoryId === bsgCategoryId;
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsByBsgCategoryIds(context, bsgCategoryIds, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter((rawItem) => {
            return bsgCategoryIds.some(catId => catId === rawItem.bsgCategoryId);
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsByCategoryEnums(context, names, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
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

    async getItemsByHandbookCategoryEnums(context, names, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        const categories = (await this.getHandbookCategories()).filter(cat => names.includes(cat.enumName));
        return items.filter((rawItem) => {
            return rawItem.handbookCategories.some(catId => categories.some(cat => cat.id === catId));
        }).map((rawItem) => {
            if (!format) return rawItem;
            return this.formatItem(rawItem)
        });
    }

    async getItemsInBsgCategory(context, bsgCategoryId, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter(item => {
            return item.categories.includes(bsgCategoryId);
        }).map(item => {
            if (!format) return item;
            return this.formatItem(item);
        });
    }

    async getItemByNormalizedName(context, normalizedName) {
        await this.init(context);
        const item = Object.values(this.cache.Item).find((item) => item.normalized_name === normalizedName);

        if (!item) {
            return null;
        }

        return this.formatItem(item);
    }

    async getItemsByDiscardLimitedStatus(context, limited, items = false) {
        await this.init(context);
        let format = false;
        if (!items) {
            items = Object.values(this.cache.Item);
            format = true;
        }
        return items.filter(item => {
            return (item.discardLimit > -1 && limited) || (item.discardLimit == -1 && !limited);
        }).map(item => {
            if (!format) return item;
            return this.formatItem(item);
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
