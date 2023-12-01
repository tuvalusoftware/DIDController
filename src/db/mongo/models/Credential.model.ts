import {
    getModelForClass,
    index,
    modelOptions,
    prop,
} from "@typegoose/typegoose";

export interface CredentialSubject {
    did: string;
    [key: string]: any; // Additional optional fields can have any key-value pairs
}

export interface VCIssuer {
    id: string;
    [key: string]: any; // Additional optional fields can have any key-value pairs
}

interface CredentialStatus {
    id: string;
    type: string;
    statusPurpose?: string;
    statusListIndex?: string;
    statusListCredential?: string;
    [key: string]: any; // Add more additional properties as needed.
}

// Schema base on: https://www.w3.org/TR/vc-data-model-2.0/#securing-verifiable-credentials
interface VCProof {
    type: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
    [key: string]: any; // Add more additional properties as needed.
}

// Schema base on W3C: https://www.w3.org/TR/vc-data-model-2.0/#basic-concepts
// @index({  })
@modelOptions({
    options: { allowMixed: 0 },
    schemaOptions: { timestamps: true, versionKey: false },
})
export class VerifiableCredential {
    @prop({ required: true, unique: true })
    id: string;

    @prop({ required: true })
    "@context": string[];

    @prop({ required: true })
    type: string[];

    @prop({ required: true })
    issuer: string | VCIssuer;

    @prop({ required: true })
    credentialSubject: CredentialSubject | Array<CredentialSubject>;

    @prop({ required: true })
    proof: VCProof;

    @prop()
    name?: string;

    @prop()
    description?: string;

    @prop({ type: Date })
    validFrom?: Date;

    @prop({ type: Date })
    validUntil?: Date;

    @prop()
    credentialStatus?: CredentialStatus;

    @prop()
    txHash?: string;
}

export const VCModel = getModelForClass(VerifiableCredential);
