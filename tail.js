const { exec } = require('child_process');

function outputMessage(message, level) {
    const colors = {
        error: 31,
        warn: 33,
    };
    if (colors[level]) {
        message = `\x1b[${colors[level]}m${message}\x1b[0m`;
    }
    console[level](message);
}

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
    const wrangler = exec(`wrangler tail${envArg}`, {
        signal: ac.signal,
    });
    const outputLog = (rawLog) => {
        try {
            const json = JSON.parse(rawLog);
            for (const logMessage of json.logs) {
                outputMessage(logMessage.message.join('\n'), logMessage.level);
            }
        } catch (error) {
            console.log('Error processing wrangler output', error);
        }
    };
    wrangler.stdout.on('data', (data) => {
        try {
            data.trim().split('\n').forEach(json => {
                if (!json) {
                    return;
                }
                outputLog(json);
            });        
        } catch (error) {
            console.log('Error processing wrangler output', error);
        }
    });
    console.log(`Listening to worker logs for ${env} environment`);
})();