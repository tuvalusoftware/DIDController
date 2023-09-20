import { AppError } from "./AppError";

/**
 * @description Returns a detailed formatted string representation of a JavaScript error object or a custom error object.
 * @param err The JavaScript error object.
 * @returns
 */
export const stringifyError = (err: Error | AppError | any) => {
    let message = `
    Error Name (err.name): "${err.name}" 
    Error Message (err.message): "${err.message}" 
    Error Type (err.constructor.name): "${err.constructor.name}" 
    Error Code (err.code): "${err.code}"\n`;

    // Include any additional error attributes
    for (const attr in err) {
        if (err.hasOwnProperty(attr) && typeof err[attr] !== "function") {
            message += `${attr}: ${err[attr]}\n`;
        }
    }

    // Include stack trace if available
    if (err.stack) {
        message += `Stack Trace:\n${err.stack}`;
    }

    return message;
};
