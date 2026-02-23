import { z } from 'zod';

export const loginSchema = z.object({
  email: z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .pipe(
    z.email({ message: "Invalid email address" })
  ),
  password: z
  .string()
  .trim()
  .min(1, { message: "Password is required" })
  .pipe(
    z.string().min(4, { message: "Password must be at least 4 characters long" })
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
