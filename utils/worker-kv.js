class WorkerKV {
    constructor(kvName){
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
    }

    async init(){
        if (this.cache){
            return true;
        }
        if (this.loading) {
            return new Promise((resolve) => {
                const isDone = () => {
                    if (this.loading === false) {
                        resolve();
                    } else {
                        setTimeout(isDone, 5);
                    }
                }
                isDone();
            });
        }
        this.loading = true;
        return new Promise((resolve, reject) => {
            ITEM_DATA.get(this.kvName, 'json').then(data => {
                this.cache = data;
                this.loading = false;
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
    }
}

module.exports = WorkerKV;