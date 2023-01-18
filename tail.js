const { exec, spawn } = require('child_process');

const logColors = {
    error: 31,
    warn: 33,
};
const outputLog = (rawLog) => {
    try {
        const json = JSON.parse(rawLog);
        if (json.outcome !== 'ok') {
            const errorDesc = json.exceptions.map(ex => ex.message).join('; ') || json.outcome;
            console.error(`\x1b[${logColors.error}mError: ${errorDesc}\x1b[0m`);
            console.error(`\x1b[${logColors.error}mUrl: ${json.event.request.url}\x1b[0m`);
            if (json.event.request.headers.origin) {
                console.error(`\x1b[${logColors.error}mOrigin: ${json.event.request.headers.origin}\x1b[0m`);
            }
            //console.log(rawLog);
        }
        for (const logMessage of json.logs) {
            let message = logMessage.message.join('\n');
            if (logColors[logMessage.level]) {
                message = `\x1b[${logColors[logMessage.level]}m${message}\x1b[0m`;
            }
            console[logMessage.level](message);
        }
    } catch (error) {
        console.log('Error processing wrangler output', error);
    }
};

const startTail = (envArg, ac) => {
    const wrangler = exec(`wrangler tail${envArg}`, {
        signal: ac.signal,
        maxBuffer: 1024 * 4096,
    }, (error, stdout, stderr) => {
        if (error) {
          console.error('wrangler error', error);
        }
        /*if (stderr) {
            console.error(stderr);
        }
        console.log(stdout);*/
    });
    wrangler.stdout.on('data', (data) => {
        try {
            data.trim().split('\n').forEach(json => {
                if (!json) {
                    return;
                }
                outputLog(json);
            });        
        } catch (error) {
            console.error('Error processing wrangler output', error);
        }
    });
    wrangler.on('close', (code) => {
        console.log(`wranger exited with code ${code}`);
    });
};

(async () => {
    const ac = new AbortController();
    const shutdown = () => {
        ac.abort();
    };
    //gracefully shutdown on Ctrl+C
    process.on( 'SIGINT', shutdown);
    //gracefully shutdown on Ctrl+Break
    process.on( 'SIGBREAK', shutdown);
    //try to gracefully shutdown on terminal closed
    process.on( 'SIGHUP', shutdown);

    let envArg = '';
    let env = 'production';
    if (process.argv[2] == 'development') {
        env = 'development';
        envArg = ` --env ${env}`;
    }
    //startTail(envArg, ac);
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
    wrangler.on('close', (code) => {
        console.log(`wranger exited with code ${code}`);
    });
    console.log(`Listening to worker logs for ${env} environment`);
})();