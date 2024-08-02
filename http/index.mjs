import { createServer } from 'node:http';
import 'dotenv/config';

import { getYoga } from '../index.mjs';
import getEnv from './env-binding.mjs';

const port = process.env.PORT ?? 8788;

const yoga = await getYoga(getEnv(), {waitUntil: () => {}});

const server = createServer(yoga);

// Start the server and you're done!
server.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}`);
});
