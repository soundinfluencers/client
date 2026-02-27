import { z } from 'zod';

const asTrimmedString = (v: unknown) => {
  if (v == null) return "";
  if (typeof v !== "string") return "";
  return v.trim();
};

export const forgotSchema = z.object({
  email: z.preprocess(
    asTrimmedString,
    z.string().min(1, { message: "Email is required" }).pipe(z.email("Invalid email address"))
  ),
});

export type ForgotFormData = z.infer<typeof forgotSchema>;
