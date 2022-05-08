module.exports = {
    Query: {
        item(obj, args, context, info) {
            if (args.id) return context.data.item.getItem(args.id);
            if (args.normalizedName) return context.data.item.getItemByNormalizedName(args.normalizedName);
            return Promise.reject(new Error('You must specify either the id or the normalizedName argument'));
        },
        async items(obj, args, context) {
            let items = false;
            let arguments = {
                ids: {
                    query: async ids => {
                        return context.data.item.getItemsByIDs(ids);
                    },
                    filter: ids => {
                        return items.filter(item => {
                            return ids.includes[item.id];
                        });
                    }
                },
                name: {
                    query: async name => {
                        return context.data.item.getItemsByName(name);
                    },
                    filter: name => {
                        const searchString = name.toLowerCase();
                        return items.filter(item => {
                            return item.name.toLowerCase().includes(searchString) || item.shortname.toLowerCase().includes(searchString);
                        });
                    }
                },
                type: {
                    query: async type => {
                        return context.data.item.getItemsByType(type);
                    },
                    filter: type => {
                        return items.filter(item => {
                            return item.types.includes(type);
                        });
                    }
                },
                bsgCategoryId: {
                    query: async bsgcat => {
                        return context.data.item.getItemsByBsgCategoryId(bsgcat);
                    },
                    filter: bsgcat => {
                        return items.filter(item => {
                            return item.bsgCategoryId === bsgcat;
                        });
                    }
                },
            }
            if (Object.keys(args).length === 0) return context.data.item.getAllItems();
            for (const argName in args) {
                if (!arguments[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                if (!items) {
                    items = await arguments[argName].query(args[argName]);
                } else {
                    items = arguments[argName].filter(args[argName]);
                }
            }
            return items;
        },
        itemCategories(obj, args, context) {
            return context.data.item.getCategories();
        },
        itemsByIDs(obj, args, context, info) {
            return context.data.item.getItemsByIDs(args.ids);
        },
        itemsByType(obj, args, context, info) {
            return context.data.item.getItemsByType(args.type);
        },
        itemsByName(obj, args, context, info) {
            return context.data.item.getItemsByName(args.name);
        },
        itemByNormalizedName(obj, args, context, info) {
            return context.data.item.getItemByNormalizedName(args.normalizedName);
        },
        itemsByBsgCategoryId(obj, args, context, info) {
            return context.data.item.getItemsByBsgCategoryId(args.bsgCategoryId);
        },
        historicalItemPrices(obj, args, context, info) {
            return context.data.historicalPrice.getByItemId(args.id);
        }
    },
    Item: {
        async buyFor(data, args, context) {
            if (!data.buyFor) data.buyFor = [];
            return [
                ...await context.data.traderInventory.getByItemId(data.id),
                ...data.buyFor
            ];
        },
        bsgCategory(data, args, context) {
            if (data.bsgCategoryId) return context.data.item.getCategory(data.bsgCategoryId);
            return null;
        },
        usedInTasks(data, args, context) {
            return context.data.task.getTasksRequiringItem(data.id);
        },
        receivedFromTasks(data, args, context) {
            return context.data.task.getTasksProvidingItem(data.id);
        },
        bartersFor(data, args, context) {
            return context.data.barter.getBartersForItem(data.id);
        },
        bartersUsing(data, args, context) {
            return context.data.barter.getBartersUsingItem(data.id);
        },
        craftsFor(data, args, context) {
            return context.data.craft.getCraftsForItem(data.id);
        },
        craftsUsing(data, args, context) {
            return context.data.craft.getCraftsUsingItem(data.id);
        }
    },
    ItemAttribute: {
        type(data, args, context) {
            if (data.type) return data.type;
            return data.name;
        }
    },
    ItemCategory: {
        parent(data, args, context) {
            if (data.parent_id) return context.data.item.getCategory(data.parent_id);
            return null;
        }
    },
    ItemGroup: {
        items(data, args, context) {
            return data.items.map(async item => {
                item = await item;
                return context.data.item.getItem(item.id);
            })
        }
    },
    ItemPrice: {
        currencyItem(data, args, context) {
            return context.data.item.getItem(data.currencyItem);
        }
    },
    ContainedItem: {
        item(data, args, context) {
            if (data.contains) return context.data.item.getItem(data.item, data.contains);
            return context.data.item.getItem(data.item);
        },
        quantity(data, args, context) {
            return data.count;
        }
    },
    FleaMarket: {
        name(data) {
            return 'Flea Market';
        },
        minPlayerLevel() {
            return 15;
        }
    },
    RequirementItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        },
        quantity(data) {
            return data.count;
        }
    },
    Vendor: {
        __resolveType(data, args, context) {
            if (data.trader) return 'TraderOffer';
            return 'FleaMarket';
        }
    }
};