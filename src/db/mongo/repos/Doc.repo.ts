import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { Company } from "../models/Company.model";
import { DidDoc } from "../models/DidDoc.model";
import { Doc, DocModel } from "../models/Doc.Model";

export const DocRepository = {
    isExist: async function (
        fileName: string,
        company: Company
    ): Promise<Boolean> {
        const document = await DocModel.exists({
            fileName,
            company: company,
        });
        if (!document) return false;
        return true;
    },
    findByCompanyAndFileName: async function (
        fileName: string,
        company: Company
    ) {
        const document = await DocModel.findOne({
            fileName,
            company: company,
        });
        if (!document) throw new AppError(ERROR_CODES.DOC_NOT_FOUND);
        return document;
    },
    findByDidDocAndCompany: async function (
        company: Company,
        didDoc: DidDoc
    ): Promise<Doc> {
        const document = await DocModel.findOne({
            didDoc,
            company,
        });
        if (!document) throw new AppError(ERROR_CODES.DOC_NOT_FOUND);
        return document;
    },
    deleteDoc: async function (fileName: string, company: Company) {
        try {
            const doc = await this.findByCompanyAndFileName(fileName, company);
            await doc.deleteOne();
        } catch (error) {
            throw error;
        }
    },
    findByDidDocOrCreate: async function (didDoc: DidDoc): Promise<Doc> {
        try {
            const document = await DocModel.findOne({
                didDoc,
            });
            if (!document) {
                const newDoc = await DocModel.create({
                    didDoc,
                });
                newDoc.save();
                return newDoc;
            }
            return document;
        } catch (error) {
            throw error;
        }
    },
    createDoc: async function (doc: object) {
        try {
            const newDoc = await DocModel.create(doc);
            newDoc.save();
            return newDoc;
        } catch (error) {
            throw error;
        }
    },
};
