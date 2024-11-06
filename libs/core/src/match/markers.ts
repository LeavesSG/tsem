export const identity = <const T>(item: T) => item;

export const constVal = <const T>(value: T) => () => value;
