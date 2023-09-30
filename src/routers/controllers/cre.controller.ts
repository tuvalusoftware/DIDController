import { NextFunction, Request, Response } from "express";

import type { CredentialCreationRequestBody } from "../../schemas/credential.schema";

import { OPERATION_CODES } from "../../constants/common";
import { VCRepository } from "../../db/mongo/repos/Credential.repo";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { handleMongoError } from "../../errors/errorHandlers";
import { validateRequestInputSchema } from "../../helpers/utils";
import { credentialCreateBodySchema } from "../../schemas/credential.schema";

export default {
    storeVC: async (
        req: Request<{}, {}, CredentialCreationRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = validateRequestInputSchema(
                credentialCreateBodySchema,
                req.body
            );

            const vc = await VCRepository.storeVC(payload);

            return res.status(201).json({
                vc,
                ...OPERATION_CODES.SAVE_SUCCESS,
            });
        } catch (error: any) {
            return next(error);
        }
    },
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vcs = await VCRepository.findAll();

            return res.status(201).json(vcs);
        } catch (error: any) {
            return next(error);
        }
    },
};
