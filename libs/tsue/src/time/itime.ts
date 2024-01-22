export enum TimeKey {
    Year,
    Month,
    Date,
    Hour,
    Minute,
    Second,
    Millisecond,
}

export interface iTime {
    year?: number;
    month?: number;
    date?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
}

export type TimeExpr = iTime | number[];

export type TimeVec = [number, number, number, number, number, number, number];
