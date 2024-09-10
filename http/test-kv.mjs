import 'dotenv/config';

import DataAPI from '../datasources/index.mjs';
import cloudflareKv from './cloudflare-kv.mjs';

const data = new DataAPI();

const getKv = async (kvName) => {
    const response = await cloudflareKv.get(kvName);
    if (response.status !== 200) {
        console.error('error', kvName, `${response.status} ${response.statusText}`);
        return;
    }
    console.log(response.status, kvName, (await response.text()).length);
};

for (const workerName in data.worker) {
    const worker = data.worker[workerName];
    for (const gameMode of worker.gameModes) {
        let kvName = worker.kvName;
        let suffix = '';
        if (gameMode !== 'regular') {
            suffix = `_${gameMode}`;
        }
        try {
            if (worker.kvs) {
                for (const hexKey in worker.kvs) {
                    const splitWorker = worker.kvs[hexKey];
                    const fullKvName = `${splitWorker.kvName}${suffix}`;
                    getKv(fullKvName);
                }
            } else {
                const fullKvName = `${kvName}${suffix}`;
                getKv(fullKvName);
            }
        } catch (error) {
            console.error(kvName, gameMode, error);
        }
    }
}
