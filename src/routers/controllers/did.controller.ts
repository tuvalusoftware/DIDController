import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import type {
    DidCreationRequestBody,
    DidFindByCompanyQuerySchema,
} from "../../schemas/did.schema";

import { OPERATION_CODES } from "../../constants/common";
import { DidRepository } from "../../db/mongo/repos/Did.repo";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { handleMongoError } from "../../errors/errorHandlers";
import { validateRequestInputSchema } from "../../helpers/utils";
import {
    didFindByCompanyQuerySchema,
    didStoreBodySchema,
} from "../../schemas/did.schema";

export default {
    getDidByPublicKey: async (
        req: Request<{}, {}, {}, { publicKey: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { publicKey } = validateRequestInputSchema(
                z.object({ publicKey: z.string().min(2) }),
                req.query
            );

            const did = await DidRepository.findByPKOrFail(publicKey);

            return res.json(did.transform());
        } catch (error: any) {
            return next(handleMongoError(error));
        }
    },
    getAllDidsByCompany: async (
        req: Request<{}, {}, {}, DidFindByCompanyQuerySchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = validateRequestInputSchema(
                didFindByCompanyQuerySchema,
                req.query
            );

            const includeContent = payload.content === "include" ? true : false;

            const DIDs = await DidRepository.findByCompany(
                payload.companyName,
                includeContent
            );

            return res.json(DIDs);
        } catch (error: any) {
            return next(handleMongoError(error));
        }
    },
    storeDid: async (
        req: Request<{}, {}, DidCreationRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = validateRequestInputSchema(
                didStoreBodySchema,
                req.body
            );

            const did = await DidRepository.storeDid(payload);

            return res.status(201).json({
                ...OPERATION_CODES.SAVE_SUCCESS,
            });
        } catch (error: any) {
            const err = handleMongoError(error);
            if (err.code === ERROR_CODES.MONGO_DUPLICATE_KEY.error_code)
                return next(new AppError(ERROR_CODES.FILE_EXISTED));

            return next(err);
        }
    },
    updateDid: async (
        req: Request<{}, {}, DidCreationRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = validateRequestInputSchema(
                didStoreBodySchema,
                req.body
            );

            const did = await DidRepository.updateDid(payload);

            return res.json({
                ...OPERATION_CODES.UPDATE_SUCCESS,
            });
        } catch (error: any) {
            return next(handleMongoError(error));
        }
    },
    deleteDID: async (
        req: Request<{}, {}, {}, { publicKey: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { publicKey } = validateRequestInputSchema(
                z.object({ publicKey: z.string().min(2) }),
                req.query
            );

            await DidRepository.deleteDid(publicKey);

            return res.json({
                ...OPERATION_CODES.DELETE_SUCCESS,
            });
        } catch (error: any) {
            return next(handleMongoError(error));
        }
    },
};
