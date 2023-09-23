import type { ERROR_CODE } from "./errorCodes";

export class AppError extends Error {
    constructor(
        public readonly error: ERROR_CODE,
        public readonly error_detail?: string
    ) {
        super(error.error_message);
        this.name = "AppError";
    }

    get code(): number {
        return this.error.error_code;
    }

    get message(): string {
        return this.error.error_message;
    }

    get detail() {
        return { ...this.error, error_detail: this.error_detail };
    }

    getDetail(): string | undefined {
        return this.error_detail;
    }
}
