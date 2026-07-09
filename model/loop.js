/* Lớp vòng lặp thời gian (interval/timeout) dùng chung ============================================ */

class Loop {
    constructor(time = 0, callback = () => {}, mode = '', count = 0) {
        this.time = time;
        this.callback = callback;
        this.mode = mode;
        this.count = count;
        this.currentCount = 0;
        this.intervalRun = null;
        this.stop = false;
        this.block = false;
        this.stopped = false;
    }

    #count() {
        if (this.count <= 0) return;
        this.currentCount++;
        if (this.currentCount >= this.count) this.disabled();
    }

    #interval() {
        if (this.stop) return;
        this.intervalRun = setInterval(() => {
            if (this.block) return;
            this.block = true;
            this.#count();
            this.callback();
            this.block = false;
        }, this.time);

    }

    #timeout() {
        this.#count();
        if (this.stop) {
            this.stopped = true;
            return;
        }
        this.callback();

        setTimeout(() => {
            if (this.stop) {
                this.stopped = true;
                return;
            }
            this.#timeout();
        }, this.time);

    }

    disabled() {
        this.stop = true;
        if (this.intervalRun !== null) {
            clearInterval(this.intervalRun);
            this.intervalRun = null;
            this.currentCount = 0;
            this.stopped = true;
        }
    }

    enabled() {

        if (typeof(this.callback) !== 'function') throw new Error("Callback must be a function");
        if (this.time <= 0) throw new Error("Time must be greater than 0");
        if (this.mode !== 'interval' && this.mode !== 'timeout') throw new Error("Mode must be 'interval' or 'timeout'");

        this.stop = false;
        switch (this.mode) {
            case 'interval': this.#interval(); break;
            case 'timeout': this.#timeout(); break;
            default: throw new Error("Invalid mode");
        }       
    }
}


