import { z } from "zod";

export const accountSettingsSchema = z.object({
  firstName: z.string().min(1, "Required field"),
  company: z.string().min(3, "Required field"),
  phone: z.string().min(1, "Required field"),
  email: z.string().email("Invalid email"),
  logoUrl: z.string().optional(),
  password: z.string().optional(),
});

export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;
