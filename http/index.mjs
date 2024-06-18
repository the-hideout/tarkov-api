import express from 'express';
import 'dotenv/config';

import worker from '../index.mjs';
import getEnv from './env-binding.mjs';

const port = process.env.PORT ?? 8787;

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

const app = express();
app.use(express.json({limit: '100mb'}), express.text());
app.all('*', async (req, res, next) => {
    const response = await worker.fetch(convertIncomingMessageToRequest(req), getEnv(), {waitUntil: () => {}});

    // Convert Response object to JSON
    const responseBody = await response.text();

    // Reflect headers from Response object
    //Object.entries(response.headers.raw()).forEach(([key, value]) => {
    response.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });

    // Send the status and JSON body
    res.status(response.status).send(responseBody);
});

app.listen(port, () => {
    console.log(`HTTP GraphQL server running at http://127.0.0.1:${port}`);
});
