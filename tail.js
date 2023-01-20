const { spawn } = require('child_process');

const logColors = {
    error: 31,
    info: 34,
    warn: 33,
};

const ac = new AbortController();
let envArg = '';
let logOnlyError = false;
let shuttingDown = false;

const outputLog = (rawLog) => {
    try {
        const json = JSON.parse(rawLog);
        if (logOnlyError && json.outcome === 'ok') {
            return;
        } 
        for (const logMessage of json.logs) {
            const level = logMessage.level;//json.outcome === 'ok' ? logMessage.level : 'error';
            let message = logMessage.message.join('\n');
            if (logColors[level]) {
                message = `\x1b[${logColors[level]}m${message}\x1b[0m`;
            }
            console[level](message);
        }
        if (json.outcome !== 'ok') {
            if (json.outcome === 'canceled') {
                //return;
            }
            const errorDesc = json.exceptions.map(ex => ex.message).join('; ') || json.outcome;
            console.error(`\x1b[${logColors.error}mFatal Error: ${errorDesc}\x1b[0m`);
            //console.error(`\x1b[${logColors.error}mUrl: ${json.event.request.url}\x1b[0m`);
            if (json.event.request.headers.origin) {
                console.error(`\x1b[${logColors.error}mOrigin: ${json.event.request.headers.origin}\x1b[0m`);
            }
            //console.log(rawLog);
        } 
    } catch (error) {
        console.log('Error processing wrangler output', error);
    }
};

const startTail = () => {
    const wrangler = spawn('cmd', ['/c', `wrangler tail${envArg}`], {
        signal: ac.signal,
    });
    wrangler.stdout.on('data', (data) => {
        try {
            String(data).trim().split('\n').forEach(json => {
                if (!json) {
                    return;
                }
                outputLog(json);
            });        
        } catch (error) {
            console.error('Error processing wrangler output', error);
        }
    });
    wrangler.on('error', (error) => {
        if (error.code === 'ABORT_ERR') {
            return;
        }
        console.log('wrangler process error', error);
    });
    wrangler.on('close', () => {
        //console.log(`wranger closed with code ${code}`);
        if (!shuttingDown) {
            console.log('Wrangler closed unexpectedly; restarting');
            startTail();
        }
    });
}

(async () => {
    const shutdown = () => {
        shuttingDown = true;
        ac.abort();
    };
    //gracefully shutdown on Ctrl+C
    process.on( 'SIGINT', shutdown);
    //gracefully shutdown on Ctrl+Break
    process.on( 'SIGBREAK', shutdown);
    //try to gracefully shutdown on terminal closed
    process.on( 'SIGHUP', shutdown);

    
    let env = 'production';
    if (process.argv.includes('development')) {
        env = 'development';
        envArg = ` --env ${env}`;
    }
    if (process.argv.includes('error')) {
        logOnlyError = true;
    }
    startTail();
    console.log(`Listening to worker logs for ${env} environment${logOnlyError ? ' (errors only)' : ''}`);
})();