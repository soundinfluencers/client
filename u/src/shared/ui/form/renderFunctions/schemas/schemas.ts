import { z } from "zod";

export const fullschema = z.object({});

export type FormSchema = z.infer<typeof fullschema>;
