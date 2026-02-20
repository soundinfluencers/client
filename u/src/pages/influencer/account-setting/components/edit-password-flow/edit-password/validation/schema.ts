import { z } from "zod";

const REQUIRED = "This field is required";

const requiredPassword = z
.string({ error: REQUIRED })
.trim()
.min(1, REQUIRED);

const strongPassword = z
.string()
.min(4, "Must be at least 4 characters")
.max(72, "Must be no more than 72 characters");
// .refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter")
// .refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter")
// .refine((v) => /\d/.test(v), "Must contain a number")
// .refine((v) => /[^A-Za-z0-9]/.test(v), "Must contain a special character");

export const changePasswordSchema = z
.object({
  currentPassword: requiredPassword,
  newPassword: requiredPassword.and(strongPassword),
  confirmNewPassword: requiredPassword,
})
.superRefine(({ currentPassword, newPassword, confirmNewPassword }, ctx) => {
  if (currentPassword && newPassword && currentPassword === newPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["newPassword"],
      message: "New password must be different from current password",
    });
  }

  if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmNewPassword"],
      message: "Passwords do not match",
    });
  }
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
