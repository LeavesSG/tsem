export interface Debug<T> {
    debug(this: T): string;
}

export class Debug<T> implements Debug<T> {
    static debug(self: unknown): string {
        switch (typeof self) {
            case "string":
            case "number":
            case "bigint":
            case "boolean":
            case "undefined":
                return `${self}`;
            case "symbol":
            case "object": {
                if (Array.isArray(self)) {
                    const arr = self.map((item) => this.debug(item));
                    return arr.toString();
                }
                const obj = Object.fromEntries(
                    Object.entries(self as object).map(([key, value]) => {
                        return [key, this.debug(value)];
                    }),
                );
                return JSON.stringify(obj);
            }

            case "function":
                return self.name === "anonymous" ? self.toString() : self.name;
        }
    }

    debug(this: T): string {
        return Debug.debug(this);
    }
}
