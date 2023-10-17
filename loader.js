import envHandler from './environment_handler';

// This is used in DEV environments where we don't actually connect to the KV stores...
// ...so we stub the implementations and download everything locally instead

const _get = async (url) => {
    const response = await fetch(url, {})
    return response.json()
};

if (typeof envHandler.getEnv().QUERY_CACHE === 'undefined') {
    envHandler.getEnv().QUERY_CACHE = {
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

if (typeof envHandler.getEnv().DATA_CACHE === 'undefined') {
    envHandler.getEnv().DATA_CACHE = {
        get: async (what) => {
            console.log(`trying to get ${what}`)

            if (what === 'TRADER_ITEMS') {
                console.log('getting trader items');

                return _get(
                    'https://manager.tarkov.dev/data/trader-items.json'
                );
            }

            if (what === 'ITEM_CACHE') {
                console.log('getting item cache');

                return _get(
                    'https://manager.tarkov.dev/data/item-data.json'
                );
            }

            if (what === 'BARTER_DATA') {
                console.log('getting barter data');

                return _get(
                    'https://manager.tarkov.dev/data/barter-data.json'
                );
            }

            if (what === 'CRAFT_DATA') {
                console.log('getting craft data');

                return _get(
                    'https://manager.tarkov.dev/data/craft-data.json'
                );
            }

            if (what === 'HIDEOUT_DATA') {
                console.log('getting hideout data');

                return _get(
                    'https://manager.tarkov.dev/data/hideout-data.json'
                );
            }

            if (what === 'QUEST_DATA') {
                console.log('getting quest data');

                return _get(
                    'https://manager.tarkov.dev/data/quest-data.json'
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
