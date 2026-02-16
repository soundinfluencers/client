import z from "zod";
import {
  optionalCompany, optionalVat, requiredAccountNumber,
  requiredAddress, requiredBankName, requiredCurrency, requiredIban,
  requiredPaypalEmail, requiredSelectCountryNullable, requiredSortCode,
  requiredSwiftBicCode,
  requiredText,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/validation/validation-rules/validation-rules.ts";

export const invoiceDetailsBaseSchema = z.object({
  firstName: requiredText,
  lastName: requiredText,
  address: requiredAddress,

  country: requiredSelectCountryNullable,

  company: optionalCompany,
  vatNumber: optionalVat,
  amountType: z.enum(["balance", "other"]),
  amount: z.number().nullable(),
});

export const invoiceDetailsSchema = invoiceDetailsBaseSchema.superRefine((data, ctx) => {
  if (data.amountType !== "other") return;

  if (data.amount == null) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "Amount is required",
    });
    return;
  }
  if (data.amount < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "Amount must be at least 1",
    });
    return;
  } else if (data.amount > 1000000) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "Amount must be less than 1,000,000",
    });
    return;
  }
});

export const ukBankTransferSchema = z.object({
  selectedPaymentMethod: z.literal("ukBankTransfer"),
  beneficiary: requiredText,
  beneficiaryAddress: requiredAddress,
  sortCode: requiredSortCode,
  accountNumber: requiredAccountNumber,
});
export const internationalBankTransferSchema = z.object({
  selectedPaymentMethod: z.literal("internationalBankTransfer"),
  beneficiary: requiredText,
  beneficiaryAddress: requiredAddress,
  iban: requiredIban,
  bankName: requiredBankName,
  bankCountry: requiredSelectCountryNullable,
  bankAccountCurrency: requiredCurrency,
  swiftBicCode: requiredSwiftBicCode,
});
export const paypalSchema = z.object({
  selectedPaymentMethod: z.literal("paypal"),
  paypalEmail: requiredPaypalEmail,
});

const paymentMethodDetailsSchema = z.discriminatedUnion(
  "selectedPaymentMethod",
  [ukBankTransferSchema, internationalBankTransferSchema, paypalSchema],
);

export const invoicePayloadSchema = z.intersection(invoiceDetailsSchema, paymentMethodDetailsSchema);

export type InvoicePayload = z.infer<typeof invoicePayloadSchema>;
