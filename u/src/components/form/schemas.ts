import { z } from "zod";

export const schema = z.record(z.string(), z.string().min(1));

export type FormSchema = z.infer<typeof schema>;
