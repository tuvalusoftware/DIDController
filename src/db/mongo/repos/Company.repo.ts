import { AppError } from "../../../errors/AppError";
import { ERROR_CODES } from "../../../errors/errorCodes";
import { Company, CompanyModel } from "./../models/Company.model";

export const CompanyRepository = {
    findByNameOrFail: async function (name: string) {
        const company = await CompanyModel.findOne({ name });
        if (!company) throw new AppError(ERROR_CODES.COMPANY_NOT_FOUND);

        return company;
    },
    findOrCreateCompanyByName: async function (name: string): Promise<Company> {
        const existingCompany = await CompanyModel.findOne({ name });

        // If a company with the given name exists, return it
        if (existingCompany) return existingCompany;

        // If no car with the given brandName exists, create a new one
        const newCompany = new CompanyModel({ name });
        await newCompany.save();
        return newCompany;
    },
};
