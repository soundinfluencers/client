import { z } from 'zod';

/*
* rules for negotiation form:
* - price: required, must be >=1
* - message: default message optional, but if provided must be at least 10 characters long
* - currency: default empty, required, must be one of "EUR", "USD", "GBP"
* */

export const negotiationSchema = z
.object({
  initialPrice: z
  .number({ error: "Price is required" })
  .min(1, { message: "Price must be at least 1" }),

  message: z
  .string()
  .optional()
  .refine((val) => val == null || val.length >= 10, {
    message: "Message must be at least 10 characters long",
  }),

  currency: z.enum(["EUR", "USD", "GBP"] as const).optional(),
})
.superRefine((data, ctx) => {
  if (!data.currency) {
    ctx.addIssue({
      code: "custom",
      message: "Currency is required",
      path: ["initialPrice"],
    });
  }
});

export type NegotiationFormData = z.infer<typeof negotiationSchema>;
