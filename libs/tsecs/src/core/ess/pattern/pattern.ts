export class PatternMgr<T> {
    root;
    patternMap = new Map<T, number>();
    constructor(rootPattern: T) {
        this.root = rootPattern;
    }
    validateMap(type: T) {
        if (this.patternMap.get(type)) return;
        const hierarchy = this.getHierarchy(type);
        // is not inherit from the root pattern.
        if (!hierarchy) return;
        hierarchy.reverse();
        const index = hierarchy.findIndex((item) => this.patternMap.get(item));
        return index;
    }
    getHierarchy(type: T) {
        let ptr = type;
        const hierarchy = [ptr];
        while (ptr) {
            ptr = Object.getPrototypeOf(ptr) as T;
            hierarchy.push(ptr);
            if (ptr === this.root) return hierarchy;
        }
        return undefined;
    }
}

export class PatternItem<T> {
    buf: T;
    strBuf: string;
    counter = 0;
    constructor(buf: T, strBuf: string) {
        this.buf = buf;
        this.strBuf = strBuf;
    }
    increment() {
        this.counter += 1;
        return this.counter;
    }
}
