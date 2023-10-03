import {
    DocumentType,
    Ref,
    getModelForClass,
    modelOptions,
    prop,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { Company } from "./Company.model";

@modelOptions({
    options: { allowMixed: 0 },
    schemaOptions: { versionKey: false },
})
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
            content: { ...this.toJSON(), _id: undefined },
        };
    }
}

export const DidModel = getModelForClass(Did);
