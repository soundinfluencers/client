import { z } from 'zod';

// .regex(/[A-Za-z]/, "Password must contain at least one letter")
// .regex(/\d/, "Password must contain at least one number");

const asTrimmedString = (v: unknown) => {
  if (typeof v !== "string") return "";
  return v.trim();
};

const passwordBase = z
.string({ error: "Password is required" })
.min(8, "Password must be at least 8 characters long");

export const newPasswordSchema = z
.object({
  newPassword: z.preprocess(asTrimmedString, passwordBase),
  confirmNewPassword: z.preprocess(
    asTrimmedString,
    z.string({ error: "Confirm password is required" })
    .min(8, "Confirm password must be at least 8 characters long")
  ),
})
.superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      path: ["confirmNewPassword"],
      message: "Passwords do not match",
      code: 'custom',
    });
  }
});

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
