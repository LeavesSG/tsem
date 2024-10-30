export function todo(msg = "Not implemented."): never {
    throw Error(msg);
}
