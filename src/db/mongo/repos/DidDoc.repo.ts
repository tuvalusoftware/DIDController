import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { Company } from "../models/Company.model";
import { DidModel } from "../models/Did.model";
import { DidDoc, DidDocModel } from "../models/DidDoc.model";

export const DidDocRepository = {
    findByDid: async function (did: string): Promise<Boolean> {
        const didDoc = await DidDocModel.find({ did });
        if (!didDoc) return true;
        return false;
    },
    findByCompanyAndFileName: async function (
        filaName: string,
        company: Company
    ): Promise<DidDoc> {
        try {
            const didDoc = await DidDocModel.findOne({
                company,
                did: filaName,
            });
            if (!didDoc) {
                throw new AppError(ERROR_CODES.DID_DOC_NOT_FOUND);
            }
            return didDoc;
        } catch (error) {
            throw error;
        }
    },
    findByCompany: async function (company: Company): Promise<Array<DidDoc>> {
        try {
            const didDocs = await DidDocModel.find({
                company,
            });
            if (didDocs) throw new AppError(ERROR_CODES.DID_DOC_NOT_FOUND);
            return didDocs;
        } catch (error) {
            throw error;
        }
    },
    createDicDoc: async function (didDoc: object) {
        try {
            console.log(didDoc);

            const newDidDoc = await DidDocModel.create(didDoc);
            return newDidDoc;
        } catch (error) {
            throw error;
        }
    },
};
