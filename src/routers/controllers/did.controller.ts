import { NextFunction, Request, Response } from "express";

import { OPERATION_CODES } from "../../constants/common";
import { DidModel } from "../../db/mongo/models/DID.model";

export default {
    storeDID: async (
        req: Request<
            {},
            {},
            { controller: string; did: string; data?: Record<string, any> }
        >,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const did = await DidModel.create({ ...req.body });

            return res.status(201).json({
                ...OPERATION_CODES.SAVE_SUCCESS,
                did,
            });
        } catch (error: any) {
            return next(error);
        }
    },
    getAllDIDs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const DIDs = await DidModel.find({}).sort({ createdAt: -1 });

            return res.json(DIDs);
        } catch (error: any) {
            return next(error);
        }
    },
};
