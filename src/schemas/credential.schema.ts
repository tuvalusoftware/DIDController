import { TypeOf, z } from "zod";

import { didString } from "./global.schema";

const credentialSubjectSchema = z
    .object({
        id: didString,
    })
    // Allow additional optional fields
    .nonstrict();

const issuerSchema = z.union([
    z.string().nonempty(),
    z
        .object({
            id: z.string().nonempty(),
        })
        .nonstrict(),
]);

const proofSchema = z
    .object({
        type: z.string().nonempty(),
        verificationMethod: z.string().nonempty(),
        proofPurpose: z.string().nonempty(),
        proofValue: z.string().nonempty(),
    })
    .nonstrict();

const credentialStatusSchema = z
    .object({
        id: z.string().nonempty(),
        type: z.string().nonempty(),
    })
    .nonstrict();

export const credentialCreateBodySchema = z.object({
    id: z.union([didString, z.string().url()]),
    "@context": z.array(z.string().nonempty()).nonempty(),
    type: z.array(z.string()).nonempty(),
    issuer: issuerSchema,
    credentialSubject: z.union([
        credentialSubjectSchema,
        z.array(credentialSubjectSchema).nonempty(),
    ]),
    proof: proofSchema,
    name: z.string().optional(),
    description: z.string().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    credentialStatus: credentialStatusSchema.optional(),
});

export type CredentialCreationRequestBody = TypeOf<
    typeof credentialCreateBodySchema
>;
