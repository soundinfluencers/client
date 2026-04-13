import { z } from "zod";

export const paymentCampaignSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),

  company: z.string(),
  vatNumber: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
});

export type PaymentCampaignFormValues = z.infer<typeof paymentCampaignSchema>;
