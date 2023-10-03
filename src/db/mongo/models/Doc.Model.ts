import {
    Ref,
    getModelForClass,
    modelOptions,
    prop,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Company } from "./Company.model";
import { DidDoc } from "./DidDoc.model";

@modelOptions({ options: { allowMixed: 0 } })
export class Doc extends TimeStamps {
    @prop({ ref: () => DidDoc, autopopulate: false, select: false })
    didDoc: Ref<DidDoc>;

    @prop({ ref: () => Company, autopopulate: true, select: false })
    company: Ref<Company>;

    @prop({ required: true })
    content: object;

    @prop({ required: true, unique: true })
    fileName: string;
}

export const DocModel = getModelForClass(Doc);
