export class NotImplementedError extends Error {
    override message = "The function or method called has not been implemented yet!";

    constructor(msg?: string, options?: ErrorOptions) {
        super(msg, options);
    }
}
