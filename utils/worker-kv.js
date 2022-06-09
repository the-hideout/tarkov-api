const {EventEmitter} = require('events');

class WorkerKV {
    constructor(kvName){
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.events = new EventEmitter();
        this.events.setMaxListeners(0);
    }

    async init(){
        if (this.cache){
            //console.log('already loaded', this.kvName);
            return true;
        }
        if (this.loading) {
            //console.log('waiting for load', this.kvName);
            return new Promise((resolve, reject) => {
                try {
                    this.events.once('loaded', () => {
                        //console.log(this.kvName, 'loaded event handled');
                        resolve();
                    });
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
            /*return new Promise((resolve) => {
                const isDone = () => {
                    if (this.loading === false) {
                        resolve();
                    } else {
                        try {
                            setTimeout(isDone, 5);
                        } catch (error) {
                            console.log(error.stack);
                            reject(error);
                        }
                    }
                }
                isDone();
            });*/
        }
        this.loading = true;
        return new Promise((resolve, reject) => {
            ITEM_DATA.get(this.kvName, 'json').then(data => {
                this.cache = data;
                this.loading = false;
                //console.log(this.kvName, 'listeners', this.events.listenerCount('loaded'));
                try {
                    //console.time(this.kvName+' emit');
                    this.events.emit('loaded');
                    //console.timeEnd(this.kvName+' emit');
                } catch (error) {
                    console.log(error);
                }
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
    }
}

module.exports = WorkerKV;
