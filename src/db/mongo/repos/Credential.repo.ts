import type { CredentialCreationRequestBody } from "../../../schemas/credential.schema";

import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { handleMongoError } from "../../../errors/errorHandlers";
import { VCModel, VerifiableCredential } from "../models/Credential.model";

export const VCRepository = {
    _errors: {
        notFound: new AppError(ERROR_CODES.CREDENTIAL_NOT_FOUND),
    },
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
    updateVC: async function (
        payload: CredentialCreationRequestBody
    ): Promise<VerifiableCredential> {
        try {
            const vc = await VCModel.findOneAndUpdate(
                { id: payload.id },
                { ...payload, id: undefined },
                { new: true }
            );

            if (!vc) throw this._errors.notFound;

            // Update undefined fields
            vc.proof = payload.proof || undefined;
            vc.name = payload.name || undefined;
            vc.description = payload.description || undefined;
            vc.validFrom = payload.validFrom
                ? new Date(payload.validFrom)
                : undefined;
            vc.validUntil = payload.validUntil
                ? new Date(payload.validUntil)
                : undefined;
            vc.credentialStatus = payload.credentialStatus || undefined;

            await vc.save();

            return vc;
        } catch (error: any) {
            throw handleMongoError(error);
        }
    },
    findById: async function (
        id: string
    ): Promise<VerifiableCredential | null> {
        try {
            return VCModel.findOne({ id });
        } catch (error: any) {
            throw handleMongoError(error);
        }
    },
    findByIdOrFail: async function (id: string): Promise<VerifiableCredential> {
        try {
            const vc = await this.findById(id);
            if (!vc) throw this._errors.notFound;

            return vc;
        } catch (error: any) {
            throw handleMongoError(error);
        }
    },
    /**
     * Because there's should not be any 'hash' property on a VC
     * The 'hash' on the VC will be determine by looking at the VC's id: "did:example:example2:hash"
     * ! @deprecated This method is more for compatibility with previous version of controller
     * @param hash Hash of VC
     */
    findByHash: async function (
        hash: string
    ): Promise<VerifiableCredential | null> {
        try {
            const regex = new RegExp(hash + "$");

            const vc = await VCModel.findOne({ id: { $regex: regex } });
            if (!vc) throw new AppError(ERROR_CODES.CREDENTIAL_NOT_FOUND);

            return vc;
        } catch (error: any) {
            throw handleMongoError(error);
        }
    },
};
