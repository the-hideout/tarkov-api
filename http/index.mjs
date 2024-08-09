import { createServer } from 'node:http';
import cluster from 'node:cluster';
import os from 'node:os';

import 'dotenv/config';

import getYoga from '../graphql-yoga.mjs';
import getEnv from './env-binding.mjs';

const port = process.env.PORT ?? 8788;
const workerCount = parseInt(process.env.WORKERS ?? String(os.cpus().length - 1));

/*process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception', error.stack);
});*/

if (cluster.isPrimary && workerCount > 0) {
    const kvStore = {};
    const kvLoading = {};
    const env = getEnv();
    console.log(`Starting ${workerCount} workers`);
    for (let i = 0; i < workerCount; i++) {
        cluster.fork();
    }

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', async (message) => {
            //console.log(`message from worker ${id}:`, message);
            if (message.action === 'getKv') {
                const response = {
                    action: 'kvData',
                    kvName: message.kvName,
                    id: message.id,
                };
                try {
                    if (kvStore[message.kvName]) {
                        response.data = JSON.stringify(kvStore[message.kvName]);
                    } else if (kvLoading[message.kvName]) {
                        response.data = JSON.stringify(await kvLoading[message.kvName]);
                    } else {
                        kvLoading[message.kvName] = env.DATA_CACHE.get(message.kvName, 'json');
                        const data = await kvLoading[message.kvName];
                        kvStore[message.kvName] = data;
                        delete kvLoading[message.kvName];
                        let refreshTime = 1000 * 60 * 30;
                        if (data?.expiration && new Date(data.expiration) > new Date()) {
                            refreshTime = new Date(data.expiration) - new Date();
                            if (refreshTime < 1000 * 60) {
                                refreshTime = 60000;
                            }
                        }
                        response.data = JSON.stringify(data);
                        setTimeout(() => {
                            delete kvStore[message.kvName];
                        }, refreshTime);
                    }
                } catch (error) {
                    response.error = error.message;
                }
                cluster.workers[id].send(response);
            }
        });
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    // Workers can share any TCP connection
    const yoga = await getYoga(getEnv());

    const server = createServer(yoga);

    // Start the server and you're done!
    server.listen(port, () => {
        console.info(`Server is running on http://localhost:${port}`);
    });
}
