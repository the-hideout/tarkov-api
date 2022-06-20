/**
 * This is used in DEV environments where we don't actually connect to the KV stores
 * so we stub the implementations and download everything locally instead.
 */

const _get = async (url) => {
    const response = await fetch(url, {})
    return response.json()
};

if (typeof QUERY_CACHE === 'undefined') {
    global.QUERY_CACHE = {
        get: async (...a) => {
            console.log('trying to GET query cache', ...a)
            return false
        },
        put: async (...a) => {
            console.log('trying to PUT query cache', ...a)
            return false
        },
    }
}

if (typeof DATA_CACHE === 'undefined') {
    global.DATA_CACHE = {
        get: async (what) => {
            console.log(`trying to get ${what}`)

            if (what === 'TRADER_ITEMS') {
                console.log('getting trader items');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/trader-items.json'
                );
            }

            if (what === 'ITEM_CACHE') {
                console.log('getting item cache');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/item-data.json'
                );
            }

            if (what === 'BARTER_DATA') {
                console.log('getting barter data');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/barter-data.json'
                );
            }

            if (what === 'CRAFT_DATA') {
                console.log('getting craft data');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/craft-data.json'
                );
            }

            if (what === 'HIDEOUT_DATA') {
                console.log('getting hideout data');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/hideout-data.json'
                );
            }

            if (what === 'QUEST_DATA') {
                console.log('getting quest data');

                return _get(
                    'https://tarkov-data-manager.herokuapp.com/data/quest-data.json'
                );
            }

            return null
        },
        put: async (...a) => {
            console.log('trying to PUT item data', ...a)
            return false
        },
    }
}
