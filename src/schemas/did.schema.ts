import { TypeOf, z } from "zod";

export const didContentSchema = {
    controller: z.string().min(2),
    did: z
        .string()
        .min(2)
        .regex(/^did:[A-Za-z0-9_]+:[A-Za-z0-9.\-:_ ]+$/),
    data: z.record(z.unknown()).optional(),
};

export const didStoreBodySchema = z.object({
    companyName: z.string().nonempty(),
    publicKey: z.string().min(2),
    content: z.object(didContentSchema),
});

export const didFindByCompanyQuerySchema = z.object({
    companyName: z.string().nonempty(),
    content: z
        .string()
        .refine(
            (value) => value === "include",
            "Only allow 'include' as value if wanted to include the DID content"
        )
        .optional(),
});

export type DidCreationRequestBody = TypeOf<typeof didStoreBodySchema>;
export type DidFindByCompanyQuerySchema = TypeOf<
    typeof didFindByCompanyQuerySchema
>;
