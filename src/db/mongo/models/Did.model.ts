import {
    DocumentType,
    Ref,
    getModelForClass,
    prop,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { Company } from "./Company.model";

export class Did extends TimeStamps {
    @prop({ ref: () => Company, autopopulate: false, select: false })
    company: Ref<Company>;

    @prop({ required: true, unique: true })
    controller: string;

    @prop({ required: true, unique: true })
    did: string;

    @prop({ required: false })
    data: object;

    transform(this: DocumentType<Did>) {
        return {
            name: this.controller,
            content: { ...this.toJSON(), __v: undefined, _id: undefined },
        };
    }
}

export const DidModel = getModelForClass(Did);
