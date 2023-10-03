import { TypeOf, z } from "zod";

export const wrappedDocBodySchema = z.object({
  companyName: z.string().nonempty(),
  fileName: z.string().min(2),
  wrappedDocument: z.object({
    data: z.object({
      issuers: z.array(
        z.object({
          address: z.string(),
        })
      ),
    }),
    signature: z.object({
      targetHash: z.string(),
    }),
  }),
});

export type WrappedDocCreationRequestBody = TypeOf<typeof wrappedDocBodySchema>;
