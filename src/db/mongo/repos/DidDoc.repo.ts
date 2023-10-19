import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { Company } from "../models/Company.model";
import { DidDoc, DidDocModel } from "../models/DidDoc.model";

export const DidDocRepository = {
    findByDid: async function (did: string): Promise<Boolean> {
        const didDoc = await DidDocModel.find({ did });
        if (!didDoc) return true;
        return false;
    },
    findByCompanyAndFileName: async function (
        fileName: string,
        company: Company
    ): Promise<DidDoc> {
        try {
            const didDoc = await DidDocModel.findOne({
                company,
                url: fileName,
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
            if (!didDocs) throw new AppError(ERROR_CODES.DID_DOC_NOT_FOUND);
            return didDocs;
        } catch (error) {
            throw error;
        }
    },
    createDicDoc: async function (didDoc: object) {
        try {
            const newDidDoc = await DidDocModel.create(didDoc);
            return newDidDoc;
        } catch (error) {
            throw error;
        }
    },
    isExists: async function (did: string, company: Company): Promise<boolean> {
        try {
            const didDoc = await DidDocModel.findOne({
                did,
                company,
            });
            if (!didDoc) {
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    },
    updateDidDoc: async function (
        company: Company,
        fileName: string,
        didDoc: object
    ): Promise<DidDoc> {
        try {
            const newDidDoc = await DidDocModel.findOneAndUpdate(
                { company, url: fileName },
                didDoc,
                { new: true }
            );
            if (!newDidDoc) {
                throw new AppError(ERROR_CODES.DID_DOC_NOT_FOUND);
            }
            await newDidDoc?.save();
            return newDidDoc;
        } catch (error) {
            throw error;
        }
    },
};
