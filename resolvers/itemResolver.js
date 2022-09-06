module.exports = {
    Query: {
        item(obj, args, context, info) {
            if (args.id) return context.data.item.getItem(args.id);
            if (args.normalizedName) return context.data.item.getItemByNormalizedName(args.normalizedName);
            return Promise.reject(new Error('You must specify either the id or the normalizedName argument'));
        },
        async items(obj, args, context, info) {
            let items = false;
            const lang = context.util.getLang(info);
            let filters = {
                ids: async ids => {
                    return context.data.item.getItemsByIDs(ids, items);
                },
                name: async name => {
                    return context.data.item.getItemsByName(name, items, lang);
                },
                names: async names => {
                    return context.data.item.getItemsByNames(names, items, lang);
                },
                type: async type => {
                    return context.data.item.getItemsByType(type, items);
                },
                types: async types => {
                    return context.data.item.getItemsByTypes(types, items);
                },
                categoryNames: async bsgcats => {
                    return context.data.item.getItemsByCategoryEnums(bsgcats, items);
                },
                bsgCategoryId: async bsgcat => {
                    return context.data.item.getItemsByBsgCategoryId(bsgcat, items);
                },
                bsgCategoryIds: async bsgcats => {
                    return context.data.item.getItemsByBsgCategoryIds(bsgcats, items);
                },
                bsgCategory: async bsgcat => {
                    return context.data.item.getItemsInBsgCategory(bsgcat, items);
                },
                /*discardLimited: async limited => {
                    return context.data.item.getItemsByDiscardLimitedStatus(limited, items);
                },*/
            }
            //if (Object.keys(args).length === 0) return context.data.item.getAllItems();
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                items = await filters[argName](args[argName], items);
            }
            if (!items) {
                items = context.data.item.getAllItems();
            }
            return context.util.paginate(items, args);
        },
        itemCategories(obj, args, context) {
            return context.util.paginate(context.data.item.getCategories(), args);
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
            return context.util.paginate(context.data.historicalPrice.getByItemId(args.id), args);
        },
        armorMaterials(obj, args, context) {
            return context.data.item.getArmorMaterials();
        },
        fleaMarket(obj, args, context) {
            return context.data.item.getFleaMarket();
        },
        playerLevels(obj, args, context) {
            return context.data.item.getPlayerLevels();
        }
    },
    Item: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        shortName(data, args, context, info) {
            return context.util.getLocale(data, 'shortName', info);
        },
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
        category(data, args, context) {
            if (data.bsgCategoryId) return context.data.item.getCategory(data.bsgCategoryId);
            return null;
        },
        categoryTop(data, args, context) {
            if (data.bsgCategoryId) return context.data.item.getTopCategory(data.bsgCategoryId);
            return null;
        },
        categories(data, args, context) {
            return data.categories.map(id => {
                return context.data.item.getCategory(id);
            });
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
        },
        async fleaMarketFee(data, args, context) {
            if (data.types.includes('noFlea')) return null;
            const options = {
                price: data.lastLowPrice || data.basePrice,
                intelCenterLevel: 0,
                hideoutManagementLevel: 0,
                count: 1,
                requireAll: false,
                ...args
            };
            const flea = await context.data.item.getFleaMarket();
            const q = options.requireAll ? 1 : options.count;
            const vo = data.basePrice * (options.count / q);
            const vr = options.price;
            let po = Math.log10(vo / vr);
            if (vr < vo) po = Math.pow(po, 1.08);
            let pr = Math.log10(vr / vo);
            if (vr >= vo) pr = Math.pow(pr, 1.08);
            const ti = flea.sellOfferFeeRate;
            const tr = flea.sellRequirementFeeRate;
            let fee = (vo * ti * Math.pow(4.0, po) * q) + (vr * tr * Math.pow(4.0, pr) * q);
            if (options.intelCenterLevel >= 3) {
                let discount = 0.3;
                discount = discount + (discount * options.hideoutManagementLevel * 0.01);
                fee = fee - (fee * discount);
            }
            return Math.round(fee);
        },
        async historicalPrices(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.historicalPrice.getByItemId(data.id);
        },
        imageLink(data) {
            return data.inspectImageLink;
        },
        iconLinkFallback(data) {
            return data.iconLink
        },
        gridImageLinkFallback(data) {
            return data.gridImageLink
        },
        imageLinkFallback(data) {
            return data.inspectImageLink;
        }
    },
    ItemAttribute: {
        type(data, args, context) {
            if (data.type) return data.type;
            return data.name;
        },
        name(data) {
            if (data.name) return data.name;
            return data.type;
        }
    },
    ItemCategory: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        parent(data, args, context) {
            if (data.parent_id) return context.data.item.getCategory(data.parent_id);
            return null;
        },
        children(data, args, context) {
            return data.child_ids.map(id => context.data.item.getCategory(id));
        }
    },
    ItemFilters: {
        allowedCategories(data, args, context) {
            return data.allowedCategories.map(id => context.data.item.getCategory(id));
        },
        allowedItems(data, args, context) {
            return data.allowedItems.map(id => context.data.item.getItem(id));
        },
        excludedCategories(data, args, context) {
            return data.excludedCategories.map(id => context.data.item.getCategory(id));
        },
        excludedItems(data, args, context) {
            return data.excludedItems.map(id => context.data.item.getItem(id));
        },
    },
    ItemPrice: {
        currencyItem(data, args, context) {
            return context.data.item.getItem(data.currencyItem);
        }
    },
    ItemProperties: {
        __resolveType(data) {
            if (data.propertiesType) return data.propertiesType;
            return null;
        }
    },
    ItemPropertiesArmor: {
        material(data, args, context) {
            return context.data.item.getArmorMaterial(data.armor_material_id);
        },
        zones(data, args, context, info) {
            return context.util.getLocale(data, 'zones', info);
        }
    },
    ItemPropertiesArmorAttachment: {
        material(data, args, context) {
            return context.data.item.getArmorMaterial(data.armor_material_id);
        },
        headZones(data, args, context, info) {
            return context.util.getLocale(data, 'headZones', info);
        }
    },
    ItemPropertiesBackpack: {
        pouches(data) {
            return data.grids;
        }
    },
    ItemPropertiesChestRig: {
        material(data, args, context) {
            return context.data.item.getArmorMaterial(data.armor_material_id);
        },
        zones(data, args, context, info) {
            return context.util.getLocale(data, 'zones', info);
        },
        pouches(data) {
            return data.grids;
        }
    },
    ItemPropertiesHelmet: {
        material(data, args, context) {
            return context.data.item.getArmorMaterial(data.armor_material_id);
        },
        headZones(data, args, context, info) {
            return context.util.getLocale(data, 'headZones', info);
        }
    },
    ItemPropertiesMagazine: {
        allowedAmmo(data, args, context) {
            return data.allowedAmmo.map(id => context.data.item.getItem(id));
        }
    },
    ItemPropertiesPreset: {
        baseItem(data, args, context) {
            return context.data.item.getItem(data.base_item_id);
        }
    },
    ItemPropertiesWeapon: {
        defaultAmmo(data, args, context) {
            if (!data.default_ammo_id) return null;
            return context.data.item.getItem(data.default_ammo_id);
        },
        fireModes(data, args, context, info) {
            return context.util.getLocale(data, 'fireModes', info);
        },
        allowedAmmo(data, args, context) {
            return data.allowedAmmo.map(id => context.data.item.getItem(id));
        }
    },
    ItemSlot: {
        name(data, ags, context, info) {
            return context.util.getLocale(data, 'name', info);
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
    ArmorMaterial: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    FleaMarket: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
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
    StimEffect: {
        type(data, args, context, info) {
            return context.util.getLocale(data, 'type', info);
        },
        skillName(data, args, context, info) {
            return context.util.getLocale(data, 'skillName', info);
        }
    },
    Vendor: {
        __resolveType(data, args, context) {
            if (data.trader) return 'TraderOffer';
            return 'FleaMarket';
        }
    }
};
