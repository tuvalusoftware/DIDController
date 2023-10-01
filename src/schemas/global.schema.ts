import { z } from "zod";

export const didString = z
    .string()
    .regex(
        /^did:[A-Za-z0-9_]+:[A-Za-z0-9.\-:_ ]+$/,
        "Invalid DID format. Please provide a valid DID string."
    );
