import type { ERROR_CODE } from "./errorCodes";

export class AppError extends Error {
    constructor(
        public readonly error: ERROR_CODE,
        public readonly error_detail?: string
    ) {
        super(error.error_message);
        this.name = "AppError";
    }

    get error_code(): number {
        return this.error.error_code;
    }

    get error_message(): string {
        return this.error.error_message;
    }

    getDetail(): string | undefined {
        return this.error_detail;
    }
}
