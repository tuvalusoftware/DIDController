import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export class Did extends TimeStamps {
    @prop({ required: true, unique: true })
    controller: string;

    @prop({ required: true, unique: true })
    did: string;

    @prop({ required: false })
    data: object;
}

export const DidModel = getModelForClass(Did);
