import { iTime, TimeExpr, TimeKey, TimeVec } from "./itime.ts";

const TIME_KEYS = ["year", "month", "date", "hour", "minute", "second", "millisecond"] as const;

export class Time {
    buf: TimeVec;
    precision: TimeKey;

    constructor(vec: TimeVec, precision: TimeKey = TimeKey.Year) {
        this.buf = vec;
        this.precision = precision;
    }
    static fromObj(exp: iTime) {
        const {
            year = 1970,
            month = 1,
            date = 1,
            hour = 0,
            minute = 0,
            second = 0,
            millisecond = 0,
        } = exp || {};
        let precision = TimeKey.Millisecond;
        while (precision > TimeKey.Year) {
            if (exp[TIME_KEYS[precision]] === undefined) precision--;
            else break;
        }
        return new this([year, month, date, hour, minute, second, millisecond], precision);
    }

    static fromVec(vec: number[]) {
        const [
            year = 1970,
            month = 1,
            date = 1,
            hour = 0,
            minute = 0,
            second = 0,
            millisecond = 0,
        ] = vec;
        let precision = TimeKey.Millisecond;
        while (precision > TimeKey.Year) {
            if (vec[precision] === void 0) precision--;
            else break;
        }
        return new this([year, month, date, hour, minute, second, millisecond], precision);
    }

    static from(exp: TimeExpr) {
        if (Array.isArray(exp)) return this.fromVec(exp);
        return this.fromObj(exp);
    }

    static copy(time: Time) {
        return new this([...time.buf], time.precision);
    }

    get maxDaysInMonth() {
        const [year, month] = this.buf;
        const run = year % 4 === 0 && (year % 400 === 0 || !(year % 100 === 0));
        if (run) return [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        return [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    get maxValue() {
        return [Infinity, 12, this.maxDaysInMonth, 23, 59, 59, 999];
    }

    cmp(other: Time) {
        for (let i = 0; i < this.buf.length; i++) {
            if (this.buf[i] > other.buf[i]) return 1;
            else if (this.buf[i] < other.buf[i]) return -1;
        }
        return 0;
    }

    minIntervalTo(other: Time) {
        return Math.min(this.precision, other.precision);
    }

    mutValidate(key = TimeKey.Millisecond) {
        const vec = this.buf;
        const incrementInner = () => {
            const max = this.maxValue[key];
            if (vec[key] <= max) return;
            const diff = vec[key] - max;
            vec[key] = key < 3 ? 1 : 0;
            vec[key - 1] += Math.ceil(diff / max);
        };
        incrementInner();
        if (key !== TimeKey.Year) this.mutValidate(key - 1);
    }

    add(time: Time) {
        for (let i = 0; i < this.buf.length - 1; i++) {
            this.buf[i] += time.buf[i];
        }
    }

    toString() {
        return `${this.buf[TimeKey.Year]}-${this.buf[TimeKey.Month].toString().padStart(2, "0")}-${
            this.buf[TimeKey.Date].toString().padStart(2, "0")
        } ${this.buf[TimeKey.Hour].toString().padStart(2, "0")}:${
            this.buf[TimeKey.Minute].toString().padStart(2, "0")
        }:${this.buf[TimeKey.Second].toString().padStart(2, "0")}.${
            this.buf[TimeKey.Millisecond].toString().padStart(3, "0")
        }`;
    }

    toDate() {
        return new Date(this.toString());
    }

    toTick() {
        return this.toDate().getTime();
    }

    genSliceTo(endTime: Time, intervalTime?: Time) {
        const minPrecision = this.minIntervalTo(endTime);
        const autoInterval = Array.from(
            this.buf,
            (_, index) => index === minPrecision ? 1 : 0,
        );
        const interval = intervalTime ?? Time.from(autoInterval);
        const currentTime = Time.copy(this);
        const increment = () => {
            currentTime.add(interval);
            currentTime.mutValidate();
        };
        const steps: Time[] = [];
        while (currentTime.cmp(endTime) === -1) {
            steps.push(Time.copy(currentTime));
            increment();
        }
        return steps;
    }
}
