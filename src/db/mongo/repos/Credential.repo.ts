import type { CredentialCreationRequestBody } from "../../../schemas/credential.schema";

import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { handleMongoError } from "../../../errors/errorHandlers";
import { VCModel, VerifiableCredential } from "../models/Credential.model";

export const VCRepository = {
    findAll: async function (): Promise<VerifiableCredential[]> {
        return await VCModel.find()
            .select("-__v -_id")
            .sort({ createdAt: -1, updatedAt: -1 });
    },
    storeVC: async function (
        payload: CredentialCreationRequestBody
    ): Promise<VerifiableCredential> {
        try {
            const vc = await VCModel.create(payload);
            return vc;
        } catch (error: any) {
            const err = handleMongoError(error);

            if (err.code === ERROR_CODES.MONGO_DUPLICATE_KEY.error_code) {
                throw new AppError(ERROR_CODES.CREDENTIAL_EXISTED);
            }

            throw err;
        }
    },
};
