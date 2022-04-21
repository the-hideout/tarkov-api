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
        buyFor(data, args, context) {
            return context.data.traderInventory.getByItemId(data.id);
        },
        usedInTasks(data, args, context) {
            return context.data.task.getTasksRequiringItem(data.id);
        },
        receivedFromTasks(data, args, context) {
            return context.data.task.getTasksProvidingItem(data.id);
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
    ContainedItem: {
        item(data, args, context) {
            if (data.item_contains) return context.data.item.getItem(data.item, data.item_contains);
            return context.data.item.getItem(data.item);
        },
        quantity(data, args, context) {
            return data.count;
        }
    },
    RequirementItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        },
        quantity(data) {
            return data.count;
        }
    }
};