import { COUNTRY_LIST } from "@/pages/influencer/components/account-setup-form/components/country-input/data/countries.data";
import type { ICountry } from "@/pages/influencer/components/account-setup-form/components/country-input/types/country.types";
import { z } from "zod";

const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

const countryMap = new Map<string, string>();

(COUNTRY_LIST as ICountry[]).forEach((c) => {
  countryMap.set(normalize(c.name), c.name);
});

const requiredText = z.string().trim().min(1); // without text
const optionalText = z.string().trim().optional().or(z.literal(""));
// const optionalNumber = z.coerce.number().optional();
const requiredAmount = z.coerce.number().finite().positive(); // without number or negative value

// PayPal email without "*" => optional, but if entered — must be an email
const requiredEmail = z
  .string()
  .trim()
  .min(1)
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "" });

const invoiceDetailsSchema = z.object({
  firstName: requiredText,
  lastName: requiredText,
  address: requiredText,

  country: z
    .string()
    .min(1)
    .transform(normalize)
    .refine((v) => countryMap.has(v), { message: "" })
    .transform((v) => countryMap.get(v)!),

  company: optionalText,
  vatNumber: optionalText,
});

const paymentMethodDetailsSchema = z.discriminatedUnion(
  "selectedPaymentMethod",
  [
    z.object({
      selectedPaymentMethod: z.literal("ukBankTransfer"),
      beneficiary: requiredText,
      beneficiaryAddress: requiredText,
      sortCode: requiredText,
      accountNumber: requiredText,
      amount: requiredAmount,
    }),

    z.object({
      selectedPaymentMethod: z.literal("internationalBankTransfer"),
      beneficiary: requiredText,
      beneficiaryAddress: requiredText,
      iban: requiredText,
      bankName: requiredText,
      bankCountry: requiredText,
      bankAccountCurrency: requiredText,
      swiftBicCode: requiredText,
      amount: requiredAmount,
    }),

    z.object({
      selectedPaymentMethod: z.literal("paypal"),
      paypalEmail: requiredEmail,
      amount: requiredAmount,
    }),
  ],
);

export const invoicePayloadSchema = invoiceDetailsSchema.and(
  paymentMethodDetailsSchema,
);

export type InvoicePayloadFormData = z.infer<typeof invoicePayloadSchema>;

// const MSG = {
//   required: "Required field",
//   invalidCountry: "Select a valid country",
//   invalidEmail: "Enter a valid email",
// } as const;

// const requiredText = z.string().trim().min(1, MSG.required);

// const optionalEmail = z
//   .string()
//   .trim()
//   .optional()
//   .or(z.literal(""))
//   .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
//     message: MSG.invalidEmail,
//   });

// const invoiceDetailsSchema = z.object({
//   firstName: requiredText,
//   lastName: requiredText,
//   address: requiredText,

//   country: z
//     .string()
//     .trim()
//     .min(1, MSG.required)
//     .transform(normalize)
//     .refine((v) => normalizedCountryNames.has(v), { message: MSG.invalidCountry }),

//   company: optionalText,
//   vatNumber: optionalText,
// });
