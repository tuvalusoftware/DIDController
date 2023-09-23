import mongoose from "mongoose";

import Logger from "../libs/Logger";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";

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

/**
 * @description Handle common Mongo/Mongoose errors
 * @param error
 */
export function handleMongoError(error: AppError | Error | any) {
    if (error.name === "MongoError") {
        switch (error.code) {
            case 11000:
                return new AppError(ERROR_CODES.MONGO_DUPLICATE_KEY);
            case 121:
                return new AppError(ERROR_CODES.MONGO_LARGE_DOCUMENT);
        }
    } else if (error instanceof mongoose.Error.ValidationError) {
        Logger.error("Mongo ValidationError: ");
        Logger.error(JSON.stringify(error.errors));

        let validationMessages = Object.values(error.errors)
            .map((err) => err.message)
            .join();

        return new AppError(ERROR_CODES.MONGO_VALIDATION, validationMessages);
    }
    // A CastError in Mongoose/MongoDB occurs when a value cannot be converted to the expected type.
    // This error can occur when you try to save a document in Mongoose and one or more of the fields do not match the expected schema type, or when you try to query the database using an invalid data type.
    // else if (error instanceof mongoose.Error.CastError) {
    //     logger.error("Mongo Cast error");
    //     return ERROR_CODES.MONGO_CAST_ERROR;
    // }
    // GeoJSON invalid
    else if (error.constructor.name === "MongoServerError") {
        Logger.error(error);

        switch (error.code) {
            case 11000:
                return new AppError(ERROR_CODES.MONGO_DUPLICATE_KEY);
            case 31254:
                return new AppError(ERROR_CODES.MONGO_FIELD_NOT_EXIST);
        }
    }
    // Unknown/Uncaught error not related to Mongo
    return error;
}
