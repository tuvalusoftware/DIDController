import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import type { CredentialCreationRequestBody } from "../../schemas/credential.schema";

import { OPERATION_CODES } from "../../constants/common";
import { VCRepository } from "../../db/mongo/repos/Credential.repo";
import { validateRequestInputSchema } from "../../helpers/utils";
import { credentialCreateBodySchema } from "../../schemas/credential.schema";
import { didString } from "../../schemas/global.schema";

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
    updateVC: async (
        req: Request<{}, {}, CredentialCreationRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = validateRequestInputSchema(
                credentialCreateBodySchema,
                req.body
            );

            const vc = await VCRepository.updateVC(payload);

            return res.status(200).json({
                vc,
                ...OPERATION_CODES.UPDATE_SUCCESS,
            });
        } catch (error: any) {
            return next(error);
        }
    },
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vcs = await VCRepository.findAll();

            return res.json(vcs);
        } catch (error: any) {
            return next(error);
        }
    },
    getById: async (
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = validateRequestInputSchema(
                z.object({ id: z.union([didString, z.string().url()]) }),
                req.params
            );

            return res.json(await VCRepository.findByIdOrFail(id));
        } catch (error: any) {
            return next(error);
        }
    },
    getByHash: async (
        req: Request<{}, {}, {}, { hash: string }>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { hash } = validateRequestInputSchema(
                z.object({ hash: z.string().nonempty() }),
                req.query
            );

            return res.json(await VCRepository.findByHash(hash));
        } catch (error: any) {
            return next(error);
        }
    },
};
