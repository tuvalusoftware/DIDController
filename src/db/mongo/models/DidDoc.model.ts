import {
    Ref,
    getModelForClass,
    modelOptions,
    prop,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import mongoose from "mongoose";
import { Company } from "./Company.model";

@modelOptions({
    options: { allowMixed: 0 },
    schemaOptions: { versionKey: false },
})
export class DidDoc extends TimeStamps {
    @prop({ ref: () => Company, autopopulate: false, select: false })
    company: Ref<Company>;

    @prop({ required: true, unique: true })
    controller: mongoose.Types.Array<string>;

    @prop({ required: true, unique: true })
    did: string;

    @prop({ required: true })
    owner: string;

    @prop({ required: true })
    holder: string;

    @prop({ required: true, unique: true })
    url: string;

    @prop({ required: false })
    meta_data: object;
}

export const DidDocModel = getModelForClass(DidDoc);
