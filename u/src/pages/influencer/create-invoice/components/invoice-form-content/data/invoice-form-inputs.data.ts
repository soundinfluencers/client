import type { TInvoicePaymentMethod } from "../../payment-bar/types/payment-method.types";
import type { IPaymentMethodField } from "../types/invoice-form-inputs.types";

export const INVOICE_DETAILS_INPUTS_DATA: IPaymentMethodField = {
  inputs: [
    {
      type: "text",
      label: "First name*",
      name: "firstName",
      placeholder: "Enter first name",
    },
    {
      type: "text",
      label: "Last name*",
      name: "lastName",
      placeholder: "Enter last name",
    },
    {
      type: "text",
      label: "Address*",
      name: "address",
      placeholder: "Enter address",
    },
    {
      type: "country",
      label: "Country*",
      name: "country",
      placeholder: "Enter country",
    },
    {
      type: "text",
      label: "Company (optional)",
      name: "company",
      placeholder: "Enter company",
    },
    {
      type: "text",
      label: "VAT number (only if VAT registered)",
      name: "vatNumber",
      placeholder: "Enter VAT number",
    },
  ],
};

export const PAYMENT_METHOD_INPUTS_DATA: Record<
  TInvoicePaymentMethod,
  IPaymentMethodField
> = {
  ukBankTransfer: {
    inputs: [
      {
        type: "text",
        label: "Beneficiary*",
        name: "beneficiary",
        placeholder: "Enter beneficiary",
      },
      {
        type: "text",
        label: "Beneficiary address*",
        name: "beneficiaryAddress",
        placeholder: "Enter beneficiary address",
      },
      {
        type: "text",
        label: "Sort code*",
        name: "sortCode",
        placeholder: "Enter sort code",
      },
      {
        type: "text",
        label: "Account number*",
        name: "accountNumber",
        placeholder: "Enter account number",
      },
    ],
  },
  internationalBankTransfer: {
    inputs: [
      {
        type: "text",
        label: "Beneficiary*",
        name: "beneficiary",
        placeholder: "Enter beneficiary",
      },
      {
        type: "text",
        label: "Beneficiary address*",
        name: "beneficiaryAddress",
        placeholder: "Enter beneficiary address",
      },
      {
        type: "text",
        label: "IBAN*",
        name: "iban",
        placeholder: "Enter IBAN",
      },
      {
        type: "text",
        label: "Bank name*",
        name: "bankName",
        placeholder: "Enter bank name",
      },
      {
        type: "country",
        label: "Bank country*",
        name: "bankCountry",
        placeholder: "Enter bank country",
      },
      {
        type: "text",
        label: "Bank account currency*",
        name: "bankAccountCurrency",
        placeholder: "Enter bank account currency",
      },
      {
        type: "text",
        label: "SWIFT / BIC*",
        name: "swiftBicCode",
        placeholder: "Enter SWIFT / BIC",
      },
    ],
  },
  paypal: {
    inputs: [
      {
        type: "email",
        label: "Paypal email*",
        name: "paypalEmail",
        placeholder: "Enter Paypal email",
      },
    ],
  },
};

// Map to get fields for clear form rendering based on payment method
export const PAYMENT_METHOD_FIELDS_MAP: Record<
  TInvoicePaymentMethod,
  string[]
> = {
  ukBankTransfer: [
    "beneficiary",
    "sortCode",
    "accountNumber",
    "beneficiaryAddress",
  ],
  internationalBankTransfer: [
    "beneficiary",
    "iban",
    "bankName",
    "swiftBicCode",
    "beneficiaryAddress",
    "bankCountry",
    "bankAccountCurrency",
  ],
  paypal: ["paypalEmail"],
};