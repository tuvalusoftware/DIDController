import { TypeOf, z } from "zod";

export const didString = z
    .string()
    .min(2)
    .regex(
        /^did:[A-Za-z0-9_]+:[A-Za-z0-9.\-:_ ]+$/,
        "Invalid DID format. Please provide a valid DID string."
    );
