import { getModelForClass, prop } from "@typegoose/typegoose";

export class Company {
    @prop({ required: true, unique: true })
    name: string;
}

export const CompanyModel = getModelForClass(Company);
