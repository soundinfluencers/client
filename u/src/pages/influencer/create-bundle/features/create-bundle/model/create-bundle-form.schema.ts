import { z } from 'zod';

export const CURRENCY = ["USD", "EUR", "GBP"] as const;

export const currencySchema = z.enum(CURRENCY);

export const priceSchema = z
.number()
.min(1, "Price is required")
.superRefine((val, ctx) => {
  if (val < 1) {
    ctx.addIssue({
      code: "custom",
      message: "Price must be 1 or more",
    });
  }

  if (val > 1_000_000) { // Optional limit to prevent excessively high prices
    ctx.addIssue({
      code: "custom",
      message: "Price is too high",
    });
  }
});


export const bundleFormSchema = z.object({
  price: priceSchema,
  currency: currencySchema,
});

export type TBundleFormValues = z.infer<typeof bundleFormSchema>;
