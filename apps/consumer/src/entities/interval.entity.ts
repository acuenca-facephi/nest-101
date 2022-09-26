export class Interval {
    readonly MIN_INTERVAL: number;
    readonly MAX_INTERVAL: number;
    private interval_time: number;

    constructor(minInterval: number, maxInterval: number, interval: number) {
        this.MIN_INTERVAL = minInterval;
        this.MAX_INTERVAL = maxInterval;
        this.setInterval(interval);
    }

    get interval(): number {
        return this.interval_time;
    }

    setInterval(newInterval: number): boolean {
        if (newInterval >= this.MIN_INTERVAL && newInterval <= this.MAX_INTERVAL) {
            this.interval_time = newInterval;
            return true;
        } else { return false; }
    }
}