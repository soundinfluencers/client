import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import type {
  IPaymentMethodField
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";

export const PAYMENT_METHOD_INPUTS_DATA: Record<
  TInvoicePaymentMethod,
  IPaymentMethodField
> = {
  ukBankTransfer: {
    inputs: [
      {
        type: "text",
        label: "Beneficiary",
        name: "beneficiary",
        placeholder: "Enter beneficiary",
      },
      {
        type: "text",
        label: "Beneficiary address",
        name: "beneficiaryAddress",
        placeholder: "Enter beneficiary address",
      },
      {
        type: "text",
        label: "Sort code",
        name: "sortCode",
        placeholder: "Enter sort code",
      },
      {
        type: "text",
        label: "Account number",
        name: "accountNumber",
        placeholder: "Enter account number",
      },
    ],
  },
  internationalBankTransfer: {
    inputs: [
      {
        type: "text",
        label: "Beneficiary",
        name: "beneficiary",
        placeholder: "Enter beneficiary",
      },
      {
        type: "text",
        label: "Beneficiary address",
        name: "beneficiaryAddress",
        placeholder: "Enter beneficiary address",
      },
      {
        type: "text",
        label: "IBAN",
        name: "iban",
        placeholder: "Enter IBAN",
      },
      {
        type: "text",
        label: "Bank name",
        name: "bankName",
        placeholder: "Enter bank name",
      },
      {
        type: "text",
        label: "Bank country",
        name: "bankCountry",
        placeholder: "Enter bank country",
      },
      {
        type: "text",
        label: "Bank account currency",
        name: "bankAccountCurrency",
        placeholder: "Enter bank account currency",
      },
      {
        type: "text",
        label: "SWIFT / BIC",
        name: "swiftBicCode",
        placeholder: "Enter SWIFT / BIC",
      },
    ],
  },
  paypal: {
    inputs: [
      {
        type: "email",
        label: "Paypal email",
        name: "paypalEmail",
        placeholder: "Enter Paypal email",
      },
    ],
  },
};