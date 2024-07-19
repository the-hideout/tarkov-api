import cluster from 'node:cluster';
import os from 'node:os';
import * as Sentry from "@sentry/node";
import "./instrument.mjs";
import express from 'express';
import 'dotenv/config';

import worker from '../index.mjs';
import getEnv from './env-binding.mjs';

const port = process.env.PORT ?? 8788;

const convertIncomingMessageToRequest = (req) => {
    var headers = new Headers();
    for (var key in req.headers) {
        if (req.headers[key]) headers.append(key, req.headers[key]);
    }
    let body = req.body;
    if (typeof body === 'object') {
        body = JSON.stringify(body);
    }
    let request = new Request(new URL(req.url, `http://127.0.0.1:${port}`).toString(), {
        method: req.method,
        body: req.method === 'POST' ? body : null,
        headers,
    })
    return request
};

if (cluster.isPrimary) {
    // Create workers (process forks) equal to the available CPUs.
    console.log(`Primary ${process.pid} is running`);
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} crashed. Starting a new worker...`);
        cluster.fork();
    });
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    // We are a worker (fork) - start a server
    const app = express();
    app.use(express.json({ limit: '100mb' }), express.text());
    app.all('*', async (req, res, next) => {
        Sentry.setUser({ ip_address: req.ip });
        const response = await worker.fetch(convertIncomingMessageToRequest(req), getEnv(), { waitUntil: () => { } });

        // Convert Response object to JSON
        const responseBody = await response.text();

        // Reflect headers from Response object
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        // Send the status and JSON body
        res.status(response.status).send(responseBody);
    });

    app.listen(port, () => {
        console.log(`HTTP GraphQL server (PID: ${process.pid}) running at http://127.0.0.1:${port}`);
    });
}


