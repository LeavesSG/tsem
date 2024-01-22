export function debugPrint(val: unknown): string {
    switch (typeof val) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
        case "undefined":
            return `${val}`;
        case "symbol":
        case "object": {
            if (Array.isArray(val)) {
                const arr = val.map((item) => debugPrint(item));
                return arr.toString();
            }
            const obj = Object.fromEntries(
                Object.entries(val as object).map(([key, value]) => {
                    return [key, debugPrint(value)];
                }),
            );
            return JSON.stringify(obj);
        }

        case "function":
            return val.name === "anonymous" ? val.toString() : val.name;
    }
}
