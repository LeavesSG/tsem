export class MatchFailedError extends Error {
    static new(message?: string, options?: ErrorOptions) {
        return new this(message, options);
    }
}
