import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { ERROR_CODES } from "../errors/errorCodes";
import Logger from "../libs/Logger";

export function handleError(
    err: any,
    req: Request,
    res: Response,
    _: NextFunction
) {
    try {
        if (err instanceof AppError) {
            throw err;
        }

        // Invalid JSON in body - body-parser
        if (err instanceof SyntaxError && "body" in err)
            throw new AppError(ERROR_CODES.INVALID_JSON_BODY);

        // Catch connection timeout and connection refuse error
        if (err.code === "ECONNABORTED")
            throw new AppError(ERROR_CODES.CONNECTION_TIMEOUT);
        if (err.code === "ECONNREFUSED")
            throw new AppError(ERROR_CODES.CONNECTION_REFUSED);

        Logger.error(err);
        throw new AppError(ERROR_CODES.UNKNOWN_ERROR);
    } catch (e: any) {
        Logger.apiError(req, e);
        return res.status(200).json((e as AppError).detail);
    }
}
