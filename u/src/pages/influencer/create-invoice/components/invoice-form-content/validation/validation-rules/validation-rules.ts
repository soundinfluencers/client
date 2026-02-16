import { z } from "zod";
// import type { ProfileCurrency } from "@/types/user/influencer.types.ts";
// const sortCode = /^\d{2}-\d{2}-\d{2}$|^\d{6}$/;

const allowedCurrencies = ["USD", "EUR", "GBP"];
const nameRegex = /^\p{L}+(?:[ -]\p{L}+)*$/u;
const addressRegex = /^[\p{L}\p{N}\s.,'’"“”/\\#№:;()-]+$/u;
const companyRegex = /^[\p{L}\p{N}\s.,'’&()-]+$/u;
const vatRegex = /^[A-Z0-9 -]+$/;
const sortCodeRegex = /^\d{6}$/;
const accountNumberRegex = /^\d{8}$/;
const ibanRegex = /^[A-Z0-9]+$/;
const swiftBicCodeRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const requiredText = z
.string({ error: "This field is required" })
.trim()
.min(2, { error: "Must contain at least 2 characters" })
.max(50, { error: "Must contain no more than 50 characters" })
.regex(nameRegex, { error: "Only letters, spaces, and hyphens are allowed" });

export const requiredAddress = z
.string({ error: "This field is required" })
.trim()
.min(5, { error: "Address is too short" })
.max(200, { error: "Address is too long" })
.regex(addressRegex, { error: "Address contains invalid characters" })
.refine((v) => /[\p{L}\p{N}]/u.test(v), { error: "Address must contain letters or digits" });

export const requiredSelectCountryNullable = z
.string({ error: "This field is required" })
.nullable()
.refine((v) => !!v && v.trim().length > 0, { error: "Please select a country" })
.transform((v) => (v ?? "").trim());

export const optionalCompany = z
.string()
.trim()
.optional()
.or(z.literal(""))
.transform((v) => (v === "" ? undefined : v))
.refine((v) => v == null || v.length >= 2, { error: "Must contain at least 2 characters" })
.refine((v) => v == null || v.length <= 80, { error: "Must contain no more than 80 characters" })
.refine((v) => v == null || companyRegex.test(v), { error: "Contains invalid characters" });

export const optionalVat = z
.string()
.trim()
.optional()
.or(z.literal(""))
.transform((v) => (v === "" ? undefined : v?.toUpperCase()))
.refine((v) => v == null || (v.length >= 5 && v.length <= 20), {
  error: "VAT number must be 5–20 characters",
})
.refine((v) => v == null || vatRegex.test(v), {
  error: "VAT number can contain only letters and digits",
});

export const requiredSortCode = z
.string()
.trim()
.min(1, { error: "Sort code is required" })
.transform((v) => v.replace(/-/g, ""))
.refine((v) => sortCodeRegex.test(v), { error: "Sort code must be 6 digits" });

export const requiredAccountNumber = z
.string({ error: "Account number is required" })
.trim()
.regex(accountNumberRegex, { error: "Account number must be 8 digits" });

export const requiredIban = z
.string({ error: "IBAN is required" })
.trim()
.min(1, { error: "IBAN is required" })
.transform((v) => v.replace(/[\s-]/g, "").toUpperCase())
.refine((v) => ibanRegex.test(v), { error: "Please enter a valid IBAN" })
.refine((v) => v.length >= 15 && v.length <= 34, { error: "IBAN must be between 15 and 34 characters" });

export const requiredSwiftBicCode = z
.string({ error: "SWIFT/BIC is required" })
.trim()
.min(1, { error: "SWIFT/BIC is required" })
.transform((v) => v.replace(/\s/g, "").toUpperCase())
.refine((v) => swiftBicCodeRegex.test(v), { error: "Please enter a valid SWIFT/BIC code" })

export const requiredBankName = z
.string({ error: "Bank name is required" })
.trim()
.min(1, "Bank name is required")
.min(2, "Please enter a valid bank name");

export const requiredCurrency = z
.string({ error: "Currency is required" })
.trim()
.min(1, { error: "Currency is required" })
.transform((v) => v.toUpperCase())
.refine((v) => allowedCurrencies.includes(v as never), {
  error: `Currency must be one of: ${allowedCurrencies.join(", ")}`,
});

export const requiredPaypalEmail = z
.email("Please enter a valid email address")
.trim()
.min(1, "PayPal email is required");

// const requiredAmount = z
// .number({ error: "Amount is required" })
// .min(1, { error: "Amount must be at least 1" })
// .max(1000000, { error: "Amount must be less than 1,000,000" });