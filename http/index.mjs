import { createServer } from 'node:http';
import cluster from 'node:cluster';
import os from 'node:os';

import 'dotenv/config';

import { getYoga } from '../index.mjs';
import getEnv from './env-binding.mjs';

const port = process.env.PORT ?? 8788;
const processes = process.env.WORKERS ?? os.cpus().length - 1;

if (cluster.isPrimary) {
    const kvStore = {};
    const kvLoading = {};
    const env = getEnv();
    console.log(`Starting ${processes} server processes`);
    for (let i = 0; i < processes; i++) {
        cluster.fork();
    }

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', async (message) => {
            console.log(`message from worker ${id}:`, message);
            if (message.action === 'getKv') {
                let data;
                if (kvStore[message.kvName]) {
                    data = kvStore[message.kvName];
                } else if (kvLoading[message.kvName]) {
                    data = await kvLoading[message.kvName];
                } else {
                    kvLoading[message.kvName] = env.DATA_CACHE.get(message.kvName, 'json');
                    data = await kvLoading[message.kvName];
                    let refreshTime = 1000 * 60 * 30;
                    if (data?.expiration && new Date(data.expiration) > new Date()) {
                        refreshTime = new Date(data.expiration) - new Date();
                        if (refreshTime < 1000 * 60) {
                            refreshTime = 60000;
                        }
                    }
                    setTimeout(() => {
                        delete kvStore[message.kvName];
                    }, refreshTime);
                }
                cluster.workers[id].send({action: 'kvData', kvName: message.kvName, data: JSON.stringify(data), id: message.id});
            }
        });
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    // Workers can share any TCP connection
    const yoga = await getYoga(getEnv(), {waitUntil: () => {}});

    const server = createServer(yoga);

    // Start the server and you're done!
    server.listen(port, () => {
        console.info(`Server is running on http://localhost:${port}`);
    });
}
