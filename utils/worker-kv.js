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
            return true;
        }
        if (this.loading) {
            return new Promise((resolve) => {
                this.events.on('loaded', () => {
                    resolve();
                });
            });
        }
        this.loading = true;
        return new Promise((resolve, reject) => {
            ITEM_DATA.get(this.kvName, 'json').then(data => {
                this.cache = data;
                this.loading = false;
                this.events.emit('loaded');
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
    }
}

module.exports = WorkerKV;
