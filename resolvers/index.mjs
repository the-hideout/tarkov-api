import { mergeResolvers } from '@graphql-tools/merge';

import ammoResolver from './ammoResolver.mjs';
import barterResolver from './barterResolver.mjs';
import craftResolver from './craftResolver.mjs';
import hideoutResolver from './hideoutResolver.mjs';
import itemResolver from './itemResolver.mjs';
import mapResolver from './mapResolver.mjs';
import statusResolver from './statusResolver.mjs';
import taskResolver from './taskResolver.mjs';
import traderResolver from './traderResolver.mjs';



const mergedResolvers = mergeResolvers([
    ammoResolver,
    barterResolver,
    craftResolver,
    hideoutResolver,
    itemResolver,
    mapResolver,
    statusResolver,
    taskResolver,
    traderResolver,
]);

export default mergedResolvers;
