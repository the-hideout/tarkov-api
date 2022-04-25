module.exports = {
    Query: {
        item(obj, args, context, info) {
            return context.data.item.getItem(args.id);
        },
        itemsByIDs(obj, args, context, info) {
            return context.data.item.getItemsByIDs(args.ids)
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