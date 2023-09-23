import { AnyZodObject, ZodError } from "zod";

import { AppError } from "../errors/AppError";
import { ERROR_CODES } from "../errors/errorCodes";
import Logger from "../libs/Logger";

/**
 * Validate the input payload against a Zod schema and return the validated data.
 * @template T - Generic type representing the expected shape of the payload.
 * @param schema - The Zod schema to validate the payload against.
 * @param payload - The input payload to be validated.
 * @returns The validated payload data.
 * @throws {SYSTEM_ERROR_OBJECT} - Throws an error with error details if the payload fails validation.
 */
export const validateRequestInputSchema = <T>(
    schema: AnyZodObject,
    payload: T
): T => {
    const validatedData = schema.safeParse(payload);

    // Check if the validation was successful
    if (validatedData.success) return validatedData.data as T;

    // If the validation fails, handle the error
    if (!(validatedData.error instanceof ZodError)) {
        // If the error is not an instance of ZodError, it is an unknown error
        Logger.error("Error while validating Request input");
        Logger.error(validatedData.error);
        throw new AppError(ERROR_CODES.UNKNOWN_ERROR);
    }

    // Extract the first detected error for simplification
    const firstError = validatedData.error.errors[0];
    let errorMessages;

    const stringifyErrorPath = (path: Array<any>) => {
        return path.filter((p) => p || p?.length > 0).join(" -> ");
    };

    // @ts-ignore
    const unionErrors = firstError.unionErrors as any;
    if (unionErrors) {
        errorMessages = `'${JSON.stringify(unionErrors[0].issues[0].path)}': ${
            unionErrors[0].issues[0].message
        }`;
    } else {
        errorMessages = `'${stringifyErrorPath(firstError.path)}': ${
            firstError.message
        }`;
    }

    // Throw an error with error details
    throw new AppError(ERROR_CODES.INVALID_INPUT, errorMessages);
};
