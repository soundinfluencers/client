import { z } from "zod";

export const paymentCampaignSchema = z.object({
  "First name*": z.string().min(1, "First name is required"),
  "Last name*": z.string().min(1, "Last name is required"),
  "Address*": z.string().min(1, "Address is required"),
  "Country*": z.string().min(1, "Country is required"),

  "Company (optional)": z.string().optional(),

  "VAT number (only if VAT registered)": z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9\-]+$/i.test(val),
      "Invalid VAT number format",
    ),
});
export type PaymentCampaignFormValues = z.infer<typeof paymentCampaignSchema>;
