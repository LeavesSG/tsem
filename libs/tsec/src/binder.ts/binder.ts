let binderCounter = 0;
const binderMarker = Symbol("Binder Marker");

interface Bind<T> {
    [binderMarker]: number;
    buf: T;
}
export type Binding<T> = (buf: T) => Bind<T>;
export function binding<T>(): Binding<T> {
    return (buf: T) => {
        return {
            [binderMarker]: binderCounter++,
            buf: buf,
        };
    };
}

export type Option<T> = T | undefined;

export const Option = {
    Some: binding(),
    None: undefined,
};

export class BindableEnum<T extends Record<string, boolean>> {
    [binderMarker]: T | undefined;
}
