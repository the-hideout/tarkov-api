import { GraphQLError } from 'graphql';

import WorkerKVSplitLocale from '../utils/worker-kv-split-locale.mjs';

class ItemsAPI extends WorkerKVSplitLocale {
    constructor(dataSource) {
        super('item_data', dataSource);
        this.gameModes.push('pve');
        this.kvs.data.postLoad = this.postLoad;
    }

    postLoad({ cache }) {
        for (const item of Object.values(cache.Item)) {
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
                    vendor: cache.FleaMarket,
                    source: 'fleaMarket',
                    requirements: [{
                        type: 'playerLevel',
                        value: cache.FleaMarket.minPlayerLevel,
                    }],
                });

                item.buyFor.push({
                    price: item.avg24hPrice || item.lastLowPrice || 0,
                    currency: 'RUB',
                    currencyItem: '5449016a4bdc2d6f028b456f',
                    priceRUB: item.avg24hPrice || item.lastLowPrice || 0,
                    vendor: cache.FleaMarket,
                    source: 'fleaMarket',
                    requirements: [{
                        type: 'playerLevel',
                        value: cache.FleaMarket.minPlayerLevel,
                    }],
                });
            }
        }
    }

    async getItem(context, info, id, contains) {
        const { cache } = await this.getCache(context, info);
        let item = cache.Item[id];
        if (!item) {
            return Promise.reject(new GraphQLError(`No item found with id ${id}`));
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

    async getAllItems(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.Item);
    }

    async getItemsByIDs(context, info, ids, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter((item) => ids.includes(item.id));
    }

    async getItemsByType(context, info, type, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter((item) => item.types.includes(type) || type === 'any');
    }

    async getItemsByTypes(context, info, types, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        if (types.includes('any')) {
            return items;
        }
        return items.filter((item) => types.some(type => item.types.includes(type)));
    }

    async getItemsByName(context, info, name, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        const searchString = name.toLowerCase();
        if (searchString === '') return Promise.reject(new GraphQLError('Searched item name cannot be blank'));

        const matchingItems = [];
        for (const item of items) {
            const fullName = await this.getLocale(item.name, context, info);
            if (fullName.toString().toLowerCase().includes(searchString)) {
                matchingItems.push(item);
                continue;
            }
            const shortName = await this.getLocale(item.shortName, context, info);
            if (shortName.toString().toLowerCase().includes(searchString)) {
                matchingItems.push(item);
            }
        }
        return matchingItems;
    }

    async getItemsByNames(context, info, names, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new GraphQLError('Searched item name cannot be blank');
            return name.toLowerCase();
        });
        const matchingItems = [];
        for (const item of items) {
            for (const search of searchStrings) {
                const fullName = await this.getLocale(item.name, context, info);
                if (fullName.toString().toLowerCase().includes(search)) {
                    matchingItems.push(item);
                    continue;
                }
                const shortName = await this.getLocale(item.shortName, context, info);
                if (shortName.toString().toLowerCase().includes(search)) {
                    matchingItems.push(item);
                }
            }
        }
        return matchingItems;
    }

    async getItemsByBsgCategoryId(context, info, bsgCategoryId, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter((item) => item.bsgCategoryId === bsgCategoryId);
    }

    async getItemsByBsgCategoryIds(context, info, bsgCategoryIds, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter((item) => bsgCategoryIds.some(catId => catId === item.bsgCategoryId));
    }

    async getItemsByCategoryEnums(context, info, names, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        const categories = (await this.getCategories(context, info)).filter(cat => names.includes(cat.enumName));
        return items.filter((item) => {
            return item.categories.some(catId => categories.some(cat => cat.id === catId));
        });
    }

    async getItemsByHandbookCategoryEnums(context, info, names, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        const categories = (await this.getHandbookCategories(context, info)).filter(cat => names.includes(cat.enumName));
        return items.filter((item) => {
            return item.handbookCategories.some(catId => categories.some(cat => cat.id === catId));
        });
    }

    async getItemsInBsgCategory(context, info, bsgCategoryId, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter(item => item.categories.includes(bsgCategoryId));
    }

    async getItemByNormalizedName(context, info, normalizedName) {
        const { cache } = await this.getCache(context, info);
        const item = Object.values(cache.Item).find((item) => item.normalizedName === normalizedName);

        if (!item) {
            return null;
        }

        return item;
    }

    async getItemsByDiscardLimitedStatus(context, info, limited, items = false) {
        const { cache } = await this.getCache(context, info);
        if (!items) {
            items = Object.values(cache.Item);
        }
        return items.filter(item => {
            return (item.discardLimit > -1 && limited) || (item.discardLimit == -1 && !limited);
        });
    }

    async getFleaMarket(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.FleaMarket;
    }

    async getAmmoList(context, info) {
        return this.getItemsByBsgCategoryId(context, info, '5485a8684bdc2da71d8b4567').then(ammoItems => {
            // ignore bb
            return ammoItems.filter(item => item.id !== '6241c316234b593b5676b637').map(item => {
                return {
                    ...item,
                    ...item.properties,
                };
            });
        });
    }

    async getCategory(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.ItemCategory[id] || cache.HandbookCategory[id];
    }

    async getTopCategory(context, info, id) {
        const cat = await this.getCategory(context, info, id);
        if (cat && cat.parent_id) return this.getTopCategory(context, info, cat.parent_id);
        return cat;
    }

    async getCategories(context, info) {
        const { cache } = await this.getCache(context, info);
        if (!cache) {
            return Promise.reject(new GraphQLError('Item cache is empty'));
        }
        const categories = [];
        for (const id in cache.ItemCategory) {
            categories.push(cache.ItemCategory[id]);
        }
        return categories;
    }

    async getCategoriesEnum(context, info) {
        const cats = await this.getCategories(context, info);
        const map = {};
        for (const id in cats) {
            map[cats[id].enumName] = cats[id];
        }
        return map;
    }

    async getHandbookCategory(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.HandbookCategory[id];
    }

    async getHandbookCategories(context, info) {
        const { cache } = await this.getCache(context, info);
        if (!cache) {
            return Promise.reject(new GraphQLError('Item cache is empty'));
        }
        return Object.values(cache.HandbookCategory);
    }

    async getArmorMaterials(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.ArmorMaterial).sort();
    }

    async getArmorMaterial(context, info, matKey) {
        const { cache } = await this.getCache(context, info);
        return cache.ArmorMaterial[matKey];
    }

    async getMasterings(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Mastering;
    }

    async getMastering(context, info, mastId) {
        const { cache } = await this.getCache(context, info);
        return cache.Mastering.find(m => m.id === mastId);
    }

    async getSkills(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Skill;
    }

    async getSkill(context, info, skillId) {
        const { cache } = await this.getCache(context, info);
        const skill = cache.Skill.find(s => s.id === skillId);
        if (!skill) {
            console.log('no skill found', skillId);
        }
        return cache.Skill.find(s => s.id === skillId);
    }

    async getPlayerLevels(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.PlayerLevel;
    }
}

export default ItemsAPI;
