export function todo(msg = ""): never {
    throw Error(msg);
}
