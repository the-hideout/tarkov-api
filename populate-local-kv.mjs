import { exec } from 'node:child_process';
import fs from 'node:fs';

import DataAPI from './datasources/index.mjs';

const data = new DataAPI();


function getKv(kvName) {
    return new Promise((resolve, reject) => {
        exec(`npx wrangler kv key get "${kvName}" --binding=DATA_CACHE --env=development`, {maxBuffer: 1024 * 35000}, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            fs.writeFileSync(`./${kvName}`, stdout);
            resolve(stdout);
        });
    });
}

function saveLocalKv(kvName) {
    console.log(`${ kvName} loading into local storage`);
    return new Promise(async (resolve, reject) => {
        await getKv(kvName).catch(reject);
        exec(`npx wrangler kv key put "${kvName}" --path="${kvName}" --binding=DATA_CACHE --env=development --local --preview false`, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            fs.rmSync(`./${kvName}`);
            resolve(stdout);
        });
    });
}

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
                    await saveLocalKv(fullKvName);
                }
            } else {
                const fullKvName = `${kvName}${suffix}`;
                await saveLocalKv(fullKvName);
            }
        } catch (error) {
            console.error(kvName, gameMode, error);
        }
    }
}
