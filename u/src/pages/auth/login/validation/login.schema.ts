import { z } from 'zod';

const asTrimmedString = (v: unknown) => {
  if (v == null) return "";
  if (typeof v !== "string") return "";
  return v.trim();
};

export const loginSchema = z.object({
  email: z.preprocess(
    asTrimmedString,
    z.string().min(1, { message: "Email is required" }).pipe(z.email("Invalid email address"))
  ),
  password: z.preprocess(
    asTrimmedString,
    z.string().min(1, { message: "Password is required" }).pipe(
      z.string().min(4, { message: "Password must be at least 4 characters long" })
    )
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
