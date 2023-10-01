import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import type { DidCreationRequestBody } from "../../../schemas/did.schema";

import { DidModel } from "../models/Did.model";
import { CompanyRepository } from "./Company.repo";

export const DidRepository = {
    findByCompany: async function (
        companyName: string,
        includeContent: boolean = false
    ) {
        const company = await CompanyRepository.findByNameOrFail(companyName);

        // Return all content
        if (includeContent) return await DidModel.find({ company });

        // Return only the public keys
        const didNames = (
            await DidModel.find({ company }).select({
                controller: 1,
            })
        ).map((d) => d.controller);
        return didNames;
    },
    findByPKOrFail: async function (publicKey: string) {
        const did = await DidModel.findOne({ controller: publicKey });
        if (!did) {
            throw new AppError(ERROR_CODES.FILE_NOT_FOUND);
        }
        return did;
    },
    storeDid: async function (payload: DidCreationRequestBody) {
        // Create company if not exist
        const company = await CompanyRepository.findOrCreateCompanyByName(
            payload.companyName
        );

        // Store the DID
        const did = await DidModel.create({ company, ...payload.content });
        return did;
    },
    updateDid: async function (payload: DidCreationRequestBody) {
        const did = await this.findByPKOrFail(payload.publicKey);

        did.data = payload.content.data as Record<string, unknown>;
        await did.save();

        return did;
    },
    deleteDid: async function (publicKey: string) {
        const did = await this.findByPKOrFail(publicKey);

        await did.deleteOne();
    },
};
